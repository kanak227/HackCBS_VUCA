#!/usr/bin/env python3
"""
Test MongoDB Connection
Run this script to test if MongoDB is properly configured and connected
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from app.db.mongodb import MongoDB
from app.core.config import settings

async def test_connection():
    """Test MongoDB connection"""
    print("🔍 Testing MongoDB Connection")
    print("=" * 50)
    print(f"MongoDB URL: {settings.MONGODB_URL}")
    print(f"Database Name: {settings.MONGODB_DB_NAME}")
    print("")
    
    try:
        # Connect to MongoDB
        print("📡 Connecting to MongoDB...")
        await MongoDB.connect()
        
        if MongoDB.client is None or MongoDB.database is None:
            print("❌ Failed to connect to MongoDB")
            print("")
            print("💡 Troubleshooting:")
            print("   1. Check if MongoDB is running:")
            print("      docker ps | grep mongo")
            print("      or")
            print("      sudo systemctl status mongod")
            print("")
            print("   2. Check MongoDB URL in .env:")
            print("      MONGODB_URL=mongodb://localhost:27017")
            print("      or for Atlas:")
            print("      MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority")
            print("")
            print("   3. Check MongoDB Atlas IP whitelist")
            print("   4. Start MongoDB:")
            print("      docker start mongodb")
            print("      or")
            print("      sudo systemctl start mongod")
            print("")
            return False
        
        # Test database access
        print("✅ Connected to MongoDB!")
        print("")
        
        db = MongoDB.get_database()
        print(f"📊 Database: {db.name}")
        print("")
        
        # List collections
        collections = await db.list_collection_names()
        print(f"📁 Collections: {len(collections)}")
        if collections:
            for collection in collections:
                count = await db[collection].count_documents({})
                print(f"   - {collection}: {count} documents")
        else:
            print("   (no collections yet)")
        print("")
        
        # Test write operation
        print("🧪 Testing write operation...")
        test_collection = db.test_connection
        result = await test_collection.insert_one({
            "test": True,
            "timestamp": "test"
        })
        print(f"✅ Write test successful (ID: {result.inserted_id})")
        
        # Clean up test document
        await test_collection.delete_one({"_id": result.inserted_id})
        print("✅ Cleanup successful")
        print("")
        
        print("🎉 MongoDB connection test passed!")
        print("")
        print("✅ MongoDB is properly configured and working")
        print("")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("")
        print("💡 Troubleshooting:")
        print("   1. Check if MongoDB is running")
        print("   2. Check MongoDB URL in .env file")
        print("   3. Check network connectivity")
        print("   4. Check MongoDB logs for errors")
        print("")
        return False
    finally:
        # Disconnect
        await MongoDB.disconnect()

if __name__ == "__main__":
    success = asyncio.run(test_connection())
    sys.exit(0 if success else 1)

