Cropper integration (added)

Files added:
- `src/components/common/CropImageStudio.jsx` — full-screen cropper UI using react-easy-crop.
- `src/components/common/ImageUploadWithCrop.jsx` — simple file input that opens cropper for selected image.
- `src/utils/process/PrsImage/createImage.js` — helper to create Image from URL.
- `src/utils/process/PrsImage/cropImage.js` — helper to produce a cropped File from selection.

How to use:
1. Install dependencies (if not installed): react-easy-crop and lucide-react are required. From project root run:

   npm install react-easy-crop lucide-react

2. Place the `ImageUploadWithCrop` component where users pick images (e.g., post creation). It will open the cropper when an image is selected.

3. `CropImageStudio` is mounted globally in `src/App.jsx`. When cropping is confirmed, it sets `selectedFile` and `preview` in the post context.

Notes:
- The cropper expects `imageToCrop` to be an object URL or data URL. `ImageUploadWithCrop` uses an object URL.
- Remember to revoke object URLs where appropriate to avoid memory leaks (e.g., call `URL.revokeObjectURL()` when the file is no longer needed).
