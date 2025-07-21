# Face-API.js Models

This directory should contain the face-api.js model files for face detection and recognition.

## Required Models

Download the following model files from the [face-api.js repository](https://github.com/justadudewhohacks/face-api.js/tree/master/weights):

### Required Files:
1. **tiny_face_detector_model-weights_manifest.json**
2. **tiny_face_detector_model-shard1**
3. **face_landmark_68_model-weights_manifest.json**
4. **face_landmark_68_model-shard1**
5. **face_recognition_model-weights_manifest.json** 
6. **face_recognition_model-shard1**
7. **face_recognition_model-shard2**

## Download Instructions

1. Go to: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
2. Download each file listed above
3. Place all downloaded files in this `/public/models/` directory
4. Ensure the files are named exactly as shown above

## Alternative Download Method

You can also download all models at once using curl or wget:

```bash
cd public/models

# Tiny Face Detector
curl -L -o tiny_face_detector_model-weights_manifest.json https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-weights_manifest.json
curl -L -o tiny_face_detector_model-shard1 https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-shard1

# Face Landmarks
curl -L -o face_landmark_68_model-weights_manifest.json https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-weights_manifest.json
curl -L -o face_landmark_68_model-shard1 https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-shard1

# Face Recognition
curl -L -o face_recognition_model-weights_manifest.json https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-weights_manifest.json
curl -L -o face_recognition_model-shard1 https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-shard1
curl -L -o face_recognition_model-shard2 https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-shard2
```

## Verification

After downloading, your `/public/models/` directory should contain:
- 7 files total
- 3 .json manifest files
- 4 shard files (binary model data)

The face capture component will not work until these models are properly downloaded and placed in this directory.