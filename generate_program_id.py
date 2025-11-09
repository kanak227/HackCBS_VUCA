#!/usr/bin/env python3
"""
Generate a Solana Program ID (for development/testing)
This generates a valid format program ID that can be used for testing
"""
import base58
import secrets

def generate_program_id():
    """Generate a valid Solana program ID format"""
    # Generate 32 random bytes (Solana public keys are 32 bytes)
    random_bytes = secrets.token_bytes(32)
    
    # Encode to base58 (Solana uses base58 encoding)
    program_id = base58.b58encode(random_bytes).decode('ascii')
    
    return program_id

if __name__ == "__main__":
    program_id = generate_program_id()
    print("=" * 60)
    print("Generated Solana Program ID (for development/testing):")
    print("=" * 60)
    print(f"\nPROGRAM_ID={program_id}\n")
    print("=" * 60)
    print("\nTo use this Program ID:")
    print("1. Copy the PROGRAM_ID above")
    print("2. Add it to backend/.env file:")
    print(f"   PROGRAM_ID={program_id}")
    print("\nNote: This is a generated ID for testing.")
    print("For production, deploy your smart contract and use the deployed Program ID.")
    print("=" * 60)


