#!/usr/bin/env python3
"""
Fix MongoDB Atlas Connection String
This script helps fix common MongoDB Atlas connection issues
"""

import sys
from urllib.parse import quote_plus

def fix_connection_string(url: str, password: str = None) -> str:
    """
    Fix MongoDB Atlas connection string format
    
    Common issues:
    1. Missing retryWrites and w=majority parameters
    2. Special characters in password not URL-encoded
    3. Missing database name in connection string
    4. Incorrect appName parameter
    """
    
    # If password provided, URL encode it
    if password:
        encoded_password = quote_plus(password)
        # Replace password in URL
        if "@" in url:
            parts = url.split("@")
            if ":" in parts[0]:
                user_pass = parts[0].split("://")[1] if "://" in parts[0] else parts[0]
                if ":" in user_pass:
                    username = user_pass.split(":")[0]
                    url = url.replace(f":{password}@", f":{encoded_password}@")
    
    # Ensure proper format
    if "mongodb+srv://" in url:
        # Remove appName if present (can cause issues)
        if "appName=" in url:
            url = url.split("?")[0] if "?" in url else url
            if "&" in url:
                url = url.split("&")[0]
        
        # Add database name if not present
        if "/?" not in url and "?retryWrites" not in url:
            if not url.endswith("/"):
                url += "/"
        
        # Add required parameters
        separator = "&" if "?" in url else "?"
        if "retryWrites" not in url:
            url += f"{separator}retryWrites=true&w=majority"
        elif "w=majority" not in url:
            url += "&w=majority"
    
    return url

def main():
    print("🔧 MongoDB Atlas Connection String Fixer")
    print("=" * 50)
    print()
    
    # Current connection string from error
    current_url = "mongodb+srv://mayank:kanak@cluster0.nj3tr35.mongodb.net/?appName=Cluster0"
    
    print("❌ Current (problematic) connection string:")
    print(f"   {current_url}")
    print()
    
    # Fix the connection string
    fixed_url = fix_connection_string(current_url, password="kanak")
    
    print("✅ Fixed connection string:")
    print(f"   {fixed_url}")
    print()
    
    # Alternative formats
    print("📝 Alternative formats to try:")
    print()
    
    # Option 1: With database name
    option1 = "mongodb+srv://mayank:kanak@cluster0.nj3tr35.mongodb.net/flexai?retryWrites=true&w=majority"
    print(f"   Option 1 (with database):")
    print(f"   {option1}")
    print()
    
    # Option 2: URL-encoded password (if password has special chars)
    encoded_pass = quote_plus("kanak")
    option2 = f"mongodb+srv://mayank:{encoded_pass}@cluster0.nj3tr35.mongodb.net/flexai?retryWrites=true&w=majority"
    print(f"   Option 2 (URL-encoded password):")
    print(f"   {option2}")
    print()
    
    # Option 3: Minimal format
    option3 = "mongodb+srv://mayank:kanak@cluster0.nj3tr35.mongodb.net/?retryWrites=true&w=majority"
    print(f"   Option 3 (minimal):")
    print(f"   {option3}")
    print()
    
    print("💡 Instructions:")
    print("   1. Copy one of the fixed connection strings above")
    print("   2. Update your .env file:")
    print("      MONGODB_URL=<fixed_connection_string>")
    print("      MONGODB_DB_NAME=flexai")
    print("   3. Test connection:")
    print("      python3 test_mongodb_connection.py")
    print()
    
    print("⚠️  Also check:")
    print("   1. MongoDB Atlas IP Whitelist:")
    print("      - Go to MongoDB Atlas Dashboard")
    print("      - Network Access → Add IP Address")
    print("      - Add 0.0.0.0/0 (allow all) for testing")
    print("      - Or add your specific IP address")
    print()
    print("   2. Database User:")
    print("      - Go to Database Access")
    print("      - Ensure user 'mayank' exists")
    print("      - Check password is correct")
    print()
    
    return fixed_url

if __name__ == "__main__":
    main()

