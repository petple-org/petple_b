const express = require('express');
const {
  uploadImage,
  uploadImages,
  deleteImage
} = require('../../controllers/image/image.controller');
const {
  uploadSingle,
  uploadMultiple,
  handleMulterError
} = require('../../middleware/upload.middleware');
const { withAuth } = require('../../middleware/withAuth.middleware');

const imageRoutes = express.Router();

// 단일 이미지 업로드 (인증 필수)
// 사용 예: POST /api/images/upload/profiles
imageRoutes.post(
  '/upload/:category',
  withAuth,
  uploadSingle,
  handleMulterError,
  uploadImage
);

// 다중 이미지 업로드 (인증 필수)
// 사용 예: POST /api/images/upload-multiple/posts
imageRoutes.post(
  '/upload-multiple/:category',
  withAuth,
  uploadMultiple,
  handleMulterError,
  uploadImages
);

// 이미지 삭제 (인증 필수)
// 사용 예: DELETE /api/images/profiles/filename.jpg
imageRoutes.delete(
  '/:category/:filename',
  withAuth,
  deleteImage
);

module.exports = imageRoutes;
