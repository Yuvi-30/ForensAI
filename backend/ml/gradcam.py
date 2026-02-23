import torch
import numpy as np
import cv2
from PIL import Image
from transformers import ViTForImageClassification, ViTImageProcessor


def generate_gradcam(
    image: Image.Image,
    model: ViTForImageClassification,
    processor: ViTImageProcessor,
    target_class: int = 0, 
) -> Image.Image:

    image_rgb = image.convert("RGB")
    inputs = processor(images=image_rgb, return_tensors="pt")

    activations = {}
    gradients = {}

    def forward_hook(module, input, output):
        activations["last_attn"] = output[0]  # (1, num_patches+1, hidden)

    def backward_hook(module, grad_input, grad_output):
        gradients["last_attn"] = grad_output[0]

    last_layer = model.vit.encoder.layer[-1].attention.attention
    fwd = last_layer.register_forward_hook(forward_hook)
    bwd = last_layer.register_full_backward_hook(backward_hook)

    # Forward pass
    outputs = model(**inputs)
    logits = outputs.logits

    # Backprop for target class
    model.zero_grad()
    logits[0, target_class].backward()

    fwd.remove()
    bwd.remove()

    act = activations["last_attn"][:, 1:, :]   # remove [CLS] token → (1, 196, 768)
    grad = gradients["last_attn"][:, 1:, :]

    weights = grad.mean(dim=-1, keepdim=True)   # (1, 196, 1)
    cam = (act * weights).sum(dim=-1)           # (1, 196)
    cam = torch.relu(cam).squeeze(0)            # (196,)

    grid_size = int(cam.shape[0] ** 0.5)
    cam = cam.reshape(grid_size, grid_size).detach().numpy()

    cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
    orig_w, orig_h = image_rgb.size
    cam_resized = cv2.resize(cam, (orig_w, orig_h))

    heatmap = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
    heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)

    orig_arr = np.array(image_rgb)
    overlay = cv2.addWeighted(orig_arr, 0.55, heatmap, 0.45, 0)

    return Image.fromarray(overlay)
