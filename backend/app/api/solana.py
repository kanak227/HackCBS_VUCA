"""
Solana blockchain integration API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from solders.pubkey import Pubkey

from app.db.database import get_db
from app.services.solana_service import SolanaService

router = APIRouter()

class TransactionRequest(BaseModel):
    session_id: str
    transaction_type: str  # register, contribute, reward
    data: dict

@router.post("/transaction")
async def execute_transaction(
    request: TransactionRequest,
    db: Session = Depends(get_db)
):
    """Execute a Solana transaction"""
    solana_service = SolanaService()
    
    try:
        if request.transaction_type == "register":
            tx_hash = await solana_service.register_training_session(
                session_id=request.data.get("session_id"),
                trainer_address=request.data.get("trainer_address"),
                model_hash=request.data.get("model_hash"),
                total_rounds=request.data.get("total_rounds")
            )
        elif request.transaction_type == "contribute":
            tx_hash = await solana_service.log_contribution(
                session_id=request.data.get("session_id"),
                contributor_address=request.data.get("contributor_address"),
                round_id=request.data.get("round_id"),
                gradient_hash=request.data.get("gradient_hash")
            )
        elif request.transaction_type == "reward":
            tx_hash = await solana_service.distribute_reward(
                contributor_address=request.data.get("contributor_address"),
                amount=request.data.get("amount"),
                session_id=request.data.get("session_id"),
                round_id=request.data.get("round_id")
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid transaction type")
        
        return {
            "transaction_type": request.transaction_type,
            "transaction_hash": tx_hash,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/balance/{address}")
async def get_balance(address: str):
    """Get real Solana wallet balance from blockchain"""
    solana_service = SolanaService()
    try:
        balance = await solana_service.get_wallet_balance(address)
        return {
            "address": address,
            "balance": balance,
            "balance_lamports": int(balance * 1e9),
            "currency": "SOL",
            "source": "blockchain"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching balance: {str(e)}")

@router.get("/token-balance/{address}")
async def get_token_balance(address: str, token_mint: Optional[str] = None):
    """Get real SPL token balance from blockchain"""
    solana_service = SolanaService()
    try:
        balance = await solana_service.get_token_balance(address, token_mint)
        return {
            "address": address,
            "balance": balance,
            "balance_tokens": int(balance * 1e9),
            "token": "SNTL",
            "token_mint": token_mint,
            "source": "blockchain"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching token balance: {str(e)}")

@router.get("/transaction/{tx_hash}")
async def get_transaction(tx_hash: str):
    """Get real transaction details from Solana blockchain"""
    solana_service = SolanaService()
    try:
        tx_details = await solana_service.get_transaction(tx_hash)
        return {
            **tx_details,
            "source": "blockchain",
            "explorer_url": f"https://solscan.io/tx/{tx_hash}" if tx_hash else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transaction: {str(e)}")

@router.get("/transactions/{address}")
async def get_address_transactions(
    address: str,
    limit: int = 50
):
    """Get recent transactions for an address"""
    solana_service = SolanaService()
    try:
        # Get signature history
        pubkey = Pubkey.from_string(address)
        response = solana_service.client.get_signatures_for_address(
            pubkey,
            limit=limit
        )
        
        transactions = []
        if response.value:
            for sig_info in response.value:
                if sig_info.signature:
                    tx_hash = str(sig_info.signature)
                    try:
                        tx_details = await solana_service.get_transaction(tx_hash)
                        transactions.append(tx_details)
                    except:
                        transactions.append({
                            "transaction_hash": tx_hash,
                            "slot": sig_info.slot,
                            "block_time": sig_info.block_time,
                            "status": "confirmed" if sig_info.err is None else "failed",
                            "error": str(sig_info.err) if sig_info.err else None
                        })
        
        return {
            "address": address,
            "transactions": transactions,
            "count": len(transactions),
            "source": "blockchain"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching transactions: {str(e)}")

