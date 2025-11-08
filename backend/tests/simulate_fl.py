"""
Simulate federated learning with multiple nodes
"""
import asyncio
import numpy as np
from app.services.federated_learning import FederatedLearningService
from app.core.security import EncryptionService, LocalDifferentialPrivacy, CommitmentHash
import base64

async def simulate_federated_learning():
    """Simulate a federated learning round with multiple contributors"""
    print("🚀 Starting Federated Learning Simulation\n")
    
    # Initialize services
    fl_service = FederatedLearningService()
    encryption_service = EncryptionService()
    ldp = LocalDifferentialPrivacy(epsilon=1.0, sensitivity=1.0)
    
    # Simulate 5 contributors
    num_contributors = 5
    num_layers = 3
    layer_sizes = [(10, 20), (20, 15), (15, 5)]
    
    print(f"📊 Simulating {num_contributors} contributors with {num_layers} layers\n")
    
    # Generate mock gradients for each contributor
    contributions = []
    for i in range(num_contributors):
        # Generate random gradients
        gradients = [np.random.randn(*size) for size in layer_sizes]
        
        # Apply local differential privacy
        noisy_gradients = ldp.add_laplace_noise(gradients)
        
        # Generate commitment hash
        commitment, nonce = CommitmentHash.generate_commitment(noisy_gradients)
        nonce_b64 = base64.b64encode(nonce).decode()
        
        # Encrypt gradients
        encrypted = encryption_service.encrypt_gradients(noisy_gradients)
        encrypted_b64 = base64.b64encode(encrypted).decode()
        
        # Mock accuracy (0.7 to 0.95)
        accuracy = 0.7 + np.random.rand() * 0.25
        privacy_score = 1.0 - (np.random.rand() * 0.2)  # 0.8 to 1.0
        
        contributions.append({
            "contributor_id": i + 1,
            "gradients": noisy_gradients,
            "encrypted": encrypted_b64,
            "commitment": commitment,
            "nonce": nonce_b64,
            "accuracy": accuracy,
            "privacy_score": privacy_score
        })
        
        print(f"✅ Contributor {i+1}: Accuracy={accuracy:.3f}, Privacy={privacy_score:.3f}")
    
    print("\n🔄 Aggregating gradients...\n")
    
    # Aggregate gradients
    gradients_list = [c["gradients"] for c in contributions]
    accuracies = [c["accuracy"] for c in contributions]
    privacy_scores = [c["privacy_score"] for c in contributions]
    
    # Weight by accuracy and privacy
    weights = np.array([acc * priv for acc, priv in zip(accuracies, privacy_scores)])
    weights = weights / weights.sum()
    
    aggregated = fl_service._federated_average(gradients_list, weights)
    avg_accuracy = np.mean(accuracies)
    
    print(f"✨ Aggregation Complete!")
    print(f"   - Contributors: {num_contributors}")
    print(f"   - Average Accuracy: {avg_accuracy:.3f}")
    print(f"   - Aggregated Layers: {len(aggregated)}")
    print(f"   - Layer Shapes: {[g.shape for g in aggregated]}\n")
    
    # Verify commitments
    print("🔐 Verifying commitments...\n")
    for i, contrib in enumerate(contributions):
        verified = CommitmentHash.verify_commitment(
            contrib["gradients"],
            contrib["commitment"],
            base64.b64decode(contrib["nonce"])
        )
        status = "✅" if verified else "❌"
        print(f"   {status} Contributor {i+1}: {'Verified' if verified else 'Failed'}")
    
    print("\n🎉 Simulation Complete!")

if __name__ == "__main__":
    asyncio.run(simulate_federated_learning())

