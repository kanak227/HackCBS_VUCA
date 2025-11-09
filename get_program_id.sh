#!/bin/bash
# Script to get a Solana Program ID
# Option 1: Generate a test Program ID (works immediately)
# Option 2: Deploy and get real Program ID (requires Solana CLI + Anchor)

echo "=========================================="
echo "Get Solana Program ID"
echo "=========================================="
echo ""
echo "Choose an option:"
echo "1. Generate a test Program ID (works now, no installation needed)"
echo "2. Deploy smart contract and get real Program ID (requires Solana CLI + Anchor)"
echo ""
read -p "Enter choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "Generating test Program ID..."
    # Generate a valid-looking program ID format
    PROGRAM_ID=$(python3 -c "import secrets; import hashlib; random_bytes = secrets.token_bytes(32); program_id = hashlib.sha256(random_bytes).hexdigest()[:44]; print(program_id.upper())" 2>/dev/null || echo "TestProgramID$(date +%s | sha256sum | head -c 32)")
    
    echo ""
    echo "=========================================="
    echo "Generated Test Program ID:"
    echo "=========================================="
    echo ""
    echo "PROGRAM_ID=$PROGRAM_ID"
    echo ""
    echo "Add this to your backend/.env file:"
    echo "PROGRAM_ID=$PROGRAM_ID"
    echo ""
    echo "Note: This is a test ID. For production, use option 2."
    echo "=========================================="
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "Checking prerequisites..."
    
    # Check Solana CLI
    if ! command -v solana &> /dev/null; then
        echo "❌ Solana CLI not found. Installing..."
        sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
        export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    fi
    
    # Check Anchor
    if ! command -v anchor &> /dev/null; then
        echo "❌ Anchor not found. Please install Anchor first:"
        echo "   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force"
        echo "   avm install latest"
        echo "   avm use latest"
        exit 1
    fi
    
    echo "✅ Prerequisites found"
    echo ""
    echo "Setting up Solana config..."
    solana config set --url devnet
    
    echo ""
    echo "Checking wallet..."
    if [ ! -f ~/.config/solana/id.json ]; then
        echo "Creating new keypair..."
        solana-keygen new --no-bip39-passphrase --outfile ~/.config/solana/id.json
    fi
    
    WALLET=$(solana address)
    echo "Wallet: $WALLET"
    
    echo ""
    echo "Requesting airdrop (devnet)..."
    solana airdrop 2 $WALLET --url devnet
    
    echo ""
    echo "Building and deploying program..."
    cd backend/programs/sentinel
    
    # Build
    anchor build
    
    # Deploy
    echo ""
    echo "Deploying to devnet..."
    DEPLOY_OUTPUT=$(anchor deploy --provider.cluster devnet 2>&1)
    echo "$DEPLOY_OUTPUT"
    
    # Extract Program ID
    PROGRAM_ID=$(echo "$DEPLOY_OUTPUT" | grep -oP 'Program Id: \K[^\s]+' || echo "")
    
    if [ -n "$PROGRAM_ID" ]; then
        echo ""
        echo "=========================================="
        echo "✅ Deployment Successful!"
        echo "=========================================="
        echo ""
        echo "PROGRAM_ID=$PROGRAM_ID"
        echo ""
        echo "Add this to your backend/.env file:"
        echo "PROGRAM_ID=$PROGRAM_ID"
        echo ""
        echo "Also update backend/programs/sentinel/src/lib.rs:"
        echo "declare_id!(\"$PROGRAM_ID\");"
        echo ""
        echo "Then rebuild: anchor build"
        echo "=========================================="
    else
        echo ""
        echo "❌ Could not extract Program ID from deployment output"
        echo "Please check the output above for the Program Id"
    fi
    
else
    echo "Invalid choice"
    exit 1
fi


