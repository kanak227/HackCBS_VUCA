"""
FlexAI Solana Service - Blockchain Integration for Challenge Marketplace
"""
from solana.rpc.api import Client
from solana.rpc.commitment import Confirmed, Finalized
from solana.rpc.types import TxOpts
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.system_program import transfer, TransferParams
# System Program ID (Solana's system program)
SYSTEM_PROGRAM_ID = Pubkey.from_string("11111111111111111111111111111111")
from solders.transaction import Transaction
from solders.message import Message
from solders.instruction import Instruction, AccountMeta
from solders.signature import Signature
try:
    from anchorpy import Wallet
except ImportError:
    Wallet = None
import base58
import hashlib
from typing import Dict, Optional, List
import asyncio
from datetime import datetime
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class FlexAISolanaService:
    """Handle Solana blockchain interactions for FlexAI marketplace"""
    
    def __init__(self):
        self.rpc_url = settings.SOLANA_RPC_URL
        self.client = Client(self.rpc_url, commitment=Confirmed)
        # Try to parse PROGRAM_ID, but handle invalid ones gracefully
        try:
            self.program_id = Pubkey.from_string(settings.PROGRAM_ID) if settings.PROGRAM_ID and len(settings.PROGRAM_ID) > 10 else None
        except (ValueError, Exception):
            self.program_id = None
            logger.warning(f"Invalid PROGRAM_ID '{settings.PROGRAM_ID}', using fallback mode")
        
        # Load keypair for signing transactions
        self.keypair = None
        self.wallet = None
        if settings.SOLANA_PRIVATE_KEY:
            try:
                if isinstance(settings.SOLANA_PRIVATE_KEY, str):
                    private_key_bytes = base58.b58decode(settings.SOLANA_PRIVATE_KEY)
                else:
                    private_key_bytes = settings.SOLANA_PRIVATE_KEY
                
                if len(private_key_bytes) == 64:
                    self.keypair = Keypair.from_bytes(private_key_bytes)
                    if Wallet:
                        self.wallet = Wallet(self.keypair)
                    logger.info(f"Wallet loaded: {self.keypair.pubkey()}")
            except Exception as e:
                logger.error(f"Error loading keypair: {e}")
    
    async def create_challenge(
        self,
        challenge_id: str,
        creator_address: str,
        reward_amount: float,
        deadline: datetime,
        baseline_accuracy: float,
        token_mint: Optional[str] = None
    ) -> str:
        """Create a challenge on Solana blockchain"""
        try:
            if not self.program_id:
                logger.warning("PROGRAM_ID not configured. Using fallback transaction.")
                return await self._fallback_challenge_transaction(creator_address)
            
            creator_pubkey = Pubkey.from_string(creator_address)
            
            # Generate challenge ID bytes
            challenge_id_bytes = self._hash_string(challenge_id)[:32]
            
            # Find PDA for challenge
            challenge_seeds = [b"challenge", challenge_id_bytes]
            challenge_pda, challenge_bump = Pubkey.find_program_address(
                challenge_seeds,
                self.program_id
            )
            
            # Convert reward amount to lamports (assuming 9 decimals for SPL token)
            reward_lamports = int(reward_amount * 1e9)
            
            # Convert deadline to timestamp
            deadline_timestamp = int(deadline.timestamp())
            
            # Convert baseline accuracy (scale by 1000: 0.85 -> 850)
            baseline_accuracy_scaled = int(baseline_accuracy * 1000)
            
            # Build instruction
            instruction = self._build_create_challenge_instruction(
                challenge_id_bytes,
                reward_lamports,
                deadline_timestamp,
                baseline_accuracy_scaled,
                challenge_bump,
                creator_pubkey,
                challenge_pda,
                token_mint
            )
            
            # Create and send transaction
            recent_blockhash = self.client.get_latest_blockhash().value.blockhash
            message = Message.new_with_blockhash(
                [instruction],
                creator_pubkey,
                recent_blockhash
            )
            transaction = Transaction.new_unsigned(message)
            
            # For now, use server-side signing if keypair available
            # In production, this should be signed by the creator's wallet
            if self.keypair:
                transaction.sign([self.keypair], recent_blockhash)
            else:
                # Return unsigned transaction for client-side signing
                logger.warning("No keypair available. Transaction must be signed client-side.")
                raise ValueError("Keypair required for server-side signing")
            
            opts = TxOpts(skip_preflight=False, preflight_commitment=Confirmed)
            result = self.client.send_transaction(transaction, opts=opts)
            
            if result.value:
                tx_signature = str(result.value)
                logger.info(f"Challenge created: {tx_signature}")
                await self._confirm_transaction(tx_signature)
                return tx_signature
            else:
                raise Exception("Transaction failed to send")
                
        except Exception as e:
            logger.error(f"Error creating challenge: {e}")
            raise
    
    async def submit_model(
        self,
        challenge_id: str,
        contributor_address: str,
        model_hash: str,
        accuracy: float,
        metadata_hash: str
    ) -> str:
        """Submit a model for a challenge"""
        try:
            if not self.program_id:
                logger.warning("PROGRAM_ID not configured. Using fallback transaction.")
                return await self._fallback_submission_transaction(contributor_address)
            
            contributor_pubkey = Pubkey.from_string(contributor_address)
            challenge_id_bytes = self._hash_string(challenge_id)[:32]
            
            # Find PDAs
            challenge_seeds = [b"challenge", challenge_id_bytes]
            challenge_pda, _ = Pubkey.find_program_address(challenge_seeds, self.program_id)
            
            submission_seeds = [
                b"submission",
                bytes(challenge_pda),
                bytes(contributor_pubkey)
            ]
            submission_pda, submission_bump = Pubkey.find_program_address(
                submission_seeds,
                self.program_id
            )
            
            # Convert hashes to bytes
            model_hash_bytes = self._hash_string(model_hash)[:32]
            metadata_hash_bytes = self._hash_string(metadata_hash)[:32]
            
            # Convert accuracy (scale by 1000)
            accuracy_scaled = int(accuracy * 1000)
            
            # Build instruction
            instruction = self._build_submit_model_instruction(
                model_hash_bytes,
                accuracy_scaled,
                metadata_hash_bytes,
                submission_bump,
                contributor_pubkey,
                challenge_pda,
                submission_pda
            )
            
            # Create and send transaction
            recent_blockhash = self.client.get_latest_blockhash().value.blockhash
            message = Message.new_with_blockhash(
                [instruction],
                contributor_pubkey,
                recent_blockhash
            )
            transaction = Transaction.new_unsigned(message)
            
            if self.keypair:
                transaction.sign([self.keypair], recent_blockhash)
            else:
                raise ValueError("Keypair required for server-side signing")
            
            opts = TxOpts(skip_preflight=False, preflight_commitment=Confirmed)
            result = self.client.send_transaction(transaction, opts=opts)
            
            if result.value:
                tx_signature = str(result.value)
                logger.info(f"Model submitted: {tx_signature}")
                await self._confirm_transaction(tx_signature)
                return tx_signature
            else:
                raise Exception("Transaction failed to send")
                
        except Exception as e:
            logger.error(f"Error submitting model: {e}")
            raise
    
    async def approve_model(
        self,
        challenge_id: str,
        contributor_address: str,
        reward_amount: float
    ) -> str:
        """Approve a model submission and distribute reward"""
        try:
            if not self.program_id:
                logger.warning("PROGRAM_ID not configured. Using fallback transaction.")
                return await self._fallback_reward_transaction(contributor_address, reward_amount)
            
            contributor_pubkey = Pubkey.from_string(contributor_address)
            challenge_id_bytes = self._hash_string(challenge_id)[:32]
            
            # Find PDAs
            challenge_seeds = [b"challenge", challenge_id_bytes]
            challenge_pda, challenge_bump = Pubkey.find_program_address(challenge_seeds, self.program_id)
            
            submission_seeds = [
                b"submission",
                bytes(challenge_pda),
                bytes(contributor_pubkey)
            ]
            submission_pda, _ = Pubkey.find_program_address(submission_seeds, self.program_id)
            
            reputation_seeds = [b"reputation", bytes(contributor_pubkey)]
            reputation_pda, reputation_bump = Pubkey.find_program_address(reputation_seeds, self.program_id)
            
            reward_vault_seeds = [b"reward_vault", bytes(challenge_pda)]
            reward_vault_pda, reward_vault_bump = Pubkey.find_program_address(reward_vault_seeds, self.program_id)
            
            # Convert reward amount
            reward_lamports = int(reward_amount * 1e9)
            
            # Build instruction
            instruction = self._build_approve_model_instruction(
                reward_vault_bump,
                challenge_bump,
                reputation_bump,
                self.keypair.pubkey() if self.keypair else Pubkey.default(),
                challenge_pda,
                submission_pda,
                contributor_pubkey,
                reputation_pda,
                reward_vault_pda,
                reward_lamports
            )
            
            # Create and send transaction
            recent_blockhash = self.client.get_latest_blockhash().value.blockhash
            authority_pubkey = self.keypair.pubkey() if self.keypair else Pubkey.default()
            message = Message.new_with_blockhash(
                [instruction],
                authority_pubkey,
                recent_blockhash
            )
            transaction = Transaction.new_unsigned(message)
            
            if self.keypair:
                transaction.sign([self.keypair], recent_blockhash)
            else:
                raise ValueError("Keypair required for server-side signing")
            
            opts = TxOpts(skip_preflight=False, preflight_commitment=Confirmed)
            result = self.client.send_transaction(transaction, opts=opts)
            
            if result.value:
                tx_signature = str(result.value)
                logger.info(f"Model approved and reward distributed: {tx_signature}")
                await self._confirm_transaction(tx_signature)
                return tx_signature
            else:
                raise Exception("Transaction failed to send")
                
        except Exception as e:
            logger.error(f"Error approving model: {e}")
            raise
    
    async def get_wallet_balance(self, address: str) -> float:
        """Get SOL balance for a wallet"""
        try:
            pubkey = Pubkey.from_string(address)
            response = self.client.get_balance(pubkey, commitment=Confirmed)
            if response.value is not None:
                return response.value / 1e9
            return 0.0
        except Exception as e:
            logger.error(f"Error getting balance: {e}")
            return 0.0
    
    async def get_transaction(self, tx_hash: str) -> Dict:
        """Get transaction details from Solana"""
        try:
            signature = Signature.from_string(tx_hash)
            response = self.client.get_transaction(
                signature,
                commitment=Confirmed,
                max_supported_transaction_version=0
            )
            if response.value:
                tx = response.value
                return {
                    "transaction_hash": tx_hash,
                    "slot": tx.slot,
                    "block_time": tx.block_time,
                    "fee": tx.meta.fee if tx.meta else 0,
                    "status": "success" if tx.meta and tx.meta.err is None else "failed",
                    "error": str(tx.meta.err) if tx.meta and tx.meta.err else None,
                }
            raise Exception("Transaction not found")
        except Exception as e:
            logger.error(f"Error getting transaction: {e}")
            raise
    
    async def _confirm_transaction(self, signature: str, max_retries: int = 30) -> bool:
        """Confirm transaction with retries"""
        try:
            sig = Signature.from_string(signature)
            for i in range(max_retries):
                response = self.client.confirm_transaction(sig, commitment=Finalized)
                if response.value:
                    if response.value[0].confirmation_status == "finalized":
                        return True
                await asyncio.sleep(1)
            return False
        except Exception as e:
            logger.error(f"Error confirming transaction: {e}")
            return False
    
    def _hash_string(self, s: str) -> bytes:
        """Hash a string to bytes"""
        return hashlib.sha256(s.encode()).digest()
    
    def _build_create_challenge_instruction(
        self,
        challenge_id_bytes: bytes,
        reward_amount: int,
        deadline: int,
        baseline_accuracy: int,
        challenge_bump: int,
        creator: Pubkey,
        challenge_pda: Pubkey,
        token_mint: Optional[str]
    ) -> Instruction:
        """Build instruction for creating challenge"""
        # Simplified instruction building - in production, use Anchor IDL
        accounts = [
            AccountMeta(pubkey=creator, is_signer=True, is_writable=True),
            AccountMeta(pubkey=challenge_pda, is_signer=False, is_writable=True),
            AccountMeta(pubkey=SYSTEM_PROGRAM_ID, is_signer=False, is_writable=False),
        ]
        
        data = bytearray()
        data.extend(b"create_challenge")
        data.extend(challenge_id_bytes[:32])
        data.extend(reward_amount.to_bytes(8, 'little'))
        data.extend(deadline.to_bytes(8, 'little', signed=True))
        data.extend(baseline_accuracy.to_bytes(2, 'little'))
        data.extend(challenge_bump.to_bytes(1, 'little'))
        
        return Instruction(
            program_id=self.program_id,
            accounts=accounts,
            data=bytes(data)
        )
    
    def _build_submit_model_instruction(
        self,
        model_hash_bytes: bytes,
        accuracy: int,
        metadata_hash_bytes: bytes,
        submission_bump: int,
        contributor: Pubkey,
        challenge_pda: Pubkey,
        submission_pda: Pubkey
    ) -> Instruction:
        """Build instruction for submitting model"""
        accounts = [
            AccountMeta(pubkey=contributor, is_signer=True, is_writable=True),
            AccountMeta(pubkey=challenge_pda, is_signer=False, is_writable=True),
            AccountMeta(pubkey=submission_pda, is_signer=False, is_writable=True),
            AccountMeta(pubkey=SYSTEM_PROGRAM_ID, is_signer=False, is_writable=False),
        ]
        
        data = bytearray()
        data.extend(b"submit_model")
        data.extend(model_hash_bytes[:32])
        data.extend(accuracy.to_bytes(2, 'little'))
        data.extend(metadata_hash_bytes[:32])
        data.extend(submission_bump.to_bytes(1, 'little'))
        
        return Instruction(
            program_id=self.program_id,
            accounts=accounts,
            data=bytes(data)
        )
    
    def _build_approve_model_instruction(
        self,
        reward_vault_bump: int,
        challenge_bump: int,
        reputation_bump: int,
        authority: Pubkey,
        challenge_pda: Pubkey,
        submission_pda: Pubkey,
        contributor: Pubkey,
        reputation_pda: Pubkey,
        reward_vault_pda: Pubkey,
        reward_amount: int
    ) -> Instruction:
        """Build instruction for approving model"""
        accounts = [
            AccountMeta(pubkey=authority, is_signer=True, is_writable=True),
            AccountMeta(pubkey=challenge_pda, is_signer=False, is_writable=True),
            AccountMeta(pubkey=submission_pda, is_signer=False, is_writable=True),
            AccountMeta(pubkey=reputation_pda, is_signer=False, is_writable=True),
            AccountMeta(pubkey=reward_vault_pda, is_signer=False, is_writable=True),
            AccountMeta(pubkey=contributor, is_signer=False, is_writable=False),
            AccountMeta(pubkey=SYSTEM_PROGRAM_ID, is_signer=False, is_writable=False),
        ]
        
        data = bytearray()
        data.extend(b"approve_model")
        data.extend(reward_vault_bump.to_bytes(1, 'little'))
        data.extend(challenge_bump.to_bytes(1, 'little'))
        data.extend(reputation_bump.to_bytes(1, 'little'))
        
        return Instruction(
            program_id=self.program_id,
            accounts=accounts,
            data=bytes(data)
        )
    
    async def _fallback_challenge_transaction(self, creator_address: str) -> str:
        """Fallback transaction when program ID is not configured"""
        if not self.keypair:
            raise ValueError("Keypair required for transactions")
        
        creator_pubkey = Pubkey.from_string(creator_address)
        recent_blockhash = self.client.get_latest_blockhash().value.blockhash
        
        transfer_ix = transfer(
            TransferParams(
                from_pubkey=self.keypair.pubkey(),
                to_pubkey=creator_pubkey,
                lamports=1
            )
        )
        
        message = Message.new_with_blockhash([transfer_ix], self.keypair.pubkey(), recent_blockhash)
        transaction = Transaction.new_unsigned(message)
        transaction.sign([self.keypair], recent_blockhash)
        
        opts = TxOpts(skip_preflight=False, preflight_commitment=Confirmed)
        result = self.client.send_transaction(transaction, opts=opts)
        
        if result.value:
            tx_signature = str(result.value)
            await self._confirm_transaction(tx_signature)
            return tx_signature
        raise Exception("Transaction failed to send")
    
    async def _fallback_submission_transaction(self, contributor_address: str) -> str:
        """Fallback transaction for submission"""
        return await self._fallback_challenge_transaction(contributor_address)
    
    async def _fallback_reward_transaction(self, contributor_address: str, reward_amount: float) -> str:
        """Fallback transaction for reward distribution"""
        if not self.keypair:
            raise ValueError("Keypair required for transactions")
        
        contributor_pubkey = Pubkey.from_string(contributor_address)
        reward_lamports = int(reward_amount * 1e9)
        recent_blockhash = self.client.get_latest_blockhash().value.blockhash
        
        transfer_ix = transfer(
            TransferParams(
                from_pubkey=self.keypair.pubkey(),
                to_pubkey=contributor_pubkey,
                lamports=reward_lamports
            )
        )
        
        message = Message.new_with_blockhash([transfer_ix], self.keypair.pubkey(), recent_blockhash)
        transaction = Transaction.new_unsigned(message)
        transaction.sign([self.keypair], recent_blockhash)
        
        opts = TxOpts(skip_preflight=False, preflight_commitment=Confirmed)
        result = self.client.send_transaction(transaction, opts=opts)
        
        if result.value:
            tx_signature = str(result.value)
            await self._confirm_transaction(tx_signature)
            return tx_signature
        raise Exception("Transaction failed to send")

# Singleton instance
flexai_solana_service = FlexAISolanaService()
