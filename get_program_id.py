#!/usr/bin/env python3
"""
Quick script to generate a Solana Program ID
Run: python3 get_program_id.py
"""
import base58
import secrets
import sys
import os

def generate_program_id():
    """Generate a valid Solana program ID format"""
    random_bytes = secrets.token_bytes(32)
    program_id = base58.b58encode(random_bytes).decode('ascii')
    return program_id

if __name__ == "__main__":
    program_id = generate_program_id()
    
    print("")
    print("=" * 70)
    print("✅ Generated Solana Program ID (for development/testing):")
    print("=" * 70)
    print("")
    print(f"PROGRAM_ID={program_id}")
    print("")
    print("📝 To use this Program ID:")
    print(f"   1. Copy: PROGRAM_ID={program_id}")
    print("   2. Add to backend/.env file")
    print("")
    print("💡 Quick update command:")
    print(f"   echo 'PROGRAM_ID={program_id}' >> backend/.env")
    print("")
    print("⚠️  Note: This is a generated ID for testing.")
    print("   For production, deploy your smart contract to get a real Program ID.")
    print("=" * 70)
    print("")


