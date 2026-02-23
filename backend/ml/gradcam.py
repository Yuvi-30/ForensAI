"""
Grad-CAM for ViT — hooks into last attention layer.
Works with any ViT variant regardless of hidden size / num heads.
"""
import torch
import numpy as np
import cv2
from PIL import Image


def generate_gradcam(
    image: Image.Image,
    model,
    processor,
    target_class: int = 0,
) -> Image.Image:

    image_rgb = image.convert("RGB")

    # processor may be feature_extractor or image_processor
    try:
        inputs = processor(images=image_rgb, return_tensors="pt")
    except Exception:
        from transformers import ViTImageProcessor
        processor = ViTImageProcessor.from_pretrained("umm-maybe/AI-image-detector")
        inputs = processor(images=image_rgb, return_tensors="pt")

    activations = {}
    gradients = {}

    def forward_hook(module, input, output):
        # output may be tuple (attn_output, attn_weights) or just tensor
        activations["val"] = output[0] if isinstance(output, tuple) else output

    def backward_hook(module, grad_input, grad_output):
        gradients["val"] = grad_output[0] if isinstance(grad_output, tuple) else grad_output

    # Find last attention layer dynamically
    last_attn = model.vit.encoder.layer[-1].attention.attention
    fwd = last_attn.register_forward_hook(forward_hook)
    bwd = last_attn.register_full_backward_hook(backward_hook)

    outputs = model(**inputs)
    model.zero_grad()
    outputs.logits[0, target_class].backward()

    fwd.remove()
    bwd.remove()

    act = activations["val"][:, 1:, :]   # remove CLS token
    grad = gradients["val"][:, 1:, :]

    weights = grad.mean(dim=-1, keepdim=True)
    cam = torch.relu((act * weights).sum(dim=-1)).squeeze(0)

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