// assets/js/viewer.js
import { api } from './api.js';

async function initViewer() {
    const params = new URLSearchParams(window.location.search);
    const modelId = params.get('id');

    if (!modelId) {
        alert('No model ID specified.');
        return;
    }

    try {
        // 1. Fetch model metadata
        const { data: model, error } = await api.models.get(modelId);

        if (error || !model) throw new Error("Model not found");

        // 2. Get Public URL for the file
        const publicUrl = api.getModelUrl(model.storage_path);

        console.log("Loading model:", publicUrl);

        // 3. Set the model source in A-Frame
        // Direct assignment is often more reliable for dynamic loading than updating asset-item
        const modelEntity = document.getElementById('ar-model');
        modelEntity.setAttribute('gltf-model', publicUrl);

        // Hide overlay when loaded (approximate, A-Frame has events but simple timeout/event listener is easier)
        document.querySelector('a-scene').addEventListener('loaded', () => {
            document.getElementById('loading-overlay').classList.add('hidden');
        });

        // Also listen for model-loaded on the entity if possible
        modelEntity.addEventListener('model-loaded', () => {
            console.log("Model loaded successfully");
            document.getElementById('loading-overlay').classList.add('hidden');
        });

        // 4. Track View
        api.models.incrementView(modelId);

    } catch (err) {
        console.error(err);
        document.getElementById('loading-overlay').innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    }
}

initViewer();
