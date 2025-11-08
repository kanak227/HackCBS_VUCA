"""
Test scripts for federated learning
"""
import pytest
import numpy as np
from app.services.federated_learning import FederatedLearningService
from app.core.security import EncryptionService, LocalDifferentialPrivacy

def test_federated_averaging():
    """Test federated averaging of gradients"""
    fl_service = FederatedLearningService()
    
    # Create mock gradients
    gradients1 = [np.array([1.0, 2.0, 3.0]), np.array([4.0, 5.0])]
    gradients2 = [np.array([2.0, 3.0, 4.0]), np.array([5.0, 6.0])]
    gradients3 = [np.array([3.0, 4.0, 5.0]), np.array([6.0, 7.0])]
    
    gradients_list = [gradients1, gradients2, gradients3]
    weights = np.array([0.5, 0.3, 0.2])
    
    # Aggregate
    aggregated = fl_service._federated_average(gradients_list, weights)
    
    # Verify results
    expected_layer1 = 0.5 * gradients1[0] + 0.3 * gradients2[0] + 0.2 * gradients3[0]
    expected_layer2 = 0.5 * gradients1[1] + 0.3 * gradients2[1] + 0.2 * gradients3[1]
    
    assert np.allclose(aggregated[0], expected_layer1)
    assert np.allclose(aggregated[1], expected_layer2)

def test_encryption():
    """Test gradient encryption and decryption"""
    encryption_service = EncryptionService()
    
    gradients = [
        np.array([1.0, 2.0, 3.0]),
        np.array([4.0, 5.0, 6.0])
    ]
    
    # Encrypt
    encrypted = encryption_service.encrypt_gradients(gradients)
    
    # Decrypt
    decrypted = encryption_service.decrypt_gradients(encrypted)
    
    # Verify
    assert len(decrypted) == len(gradients)
    for i in range(len(gradients)):
        assert np.allclose(decrypted[i], gradients[i])

def test_local_differential_privacy():
    """Test local differential privacy noise addition"""
    ldp = LocalDifferentialPrivacy(epsilon=1.0, sensitivity=1.0)
    
    gradients = [np.array([1.0, 2.0, 3.0])]
    
    # Add noise
    noisy_gradients = ldp.add_laplace_noise(gradients)
    
    # Verify noise was added
    assert not np.allclose(noisy_gradients[0], gradients[0])
    assert noisy_gradients[0].shape == gradients[0].shape

if __name__ == "__main__":
    pytest.main([__file__])

