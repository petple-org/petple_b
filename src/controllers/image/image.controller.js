const path = require('path');
const fs = require('fs').promises;
const { createError } = require('../../utils/error');
const config = require('../../consts/app');

/**
 * 단일 이미지 업로드
 * 프로필, 펫 이미지 등에 사용
 */
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError(400, '업로드할 이미지가 없습니다.');
    }

    const category = req.params.category;
    const filename = req.file.filename;

    // 이미지 URL 생성
    const imageUrl = `${config.app.backendUrl}/uploads/images/${category}/${filename}`;

    return res.status(200).json({
      success: true,
      imageUrl,
      filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    // 업로드 실패 시 파일 삭제
    if (req.file && req.file.path) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    next(error);
  }
};

/**
 * 다중 이미지 업로드
 * 게시글 이미지 등에 사용
 */
const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw createError(400, '업로드할 이미지가 없습니다.');
    }

    const category = req.params.category;
    const imageUrls = req.files.map(file => ({
      url: `${config.app.backendUrl}/uploads/images/${category}/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype
    }));

    return res.status(200).json({
      success: true,
      images: imageUrls,
      count: imageUrls.length
    });
  } catch (error) {
    // 업로드 실패 시 모든 파일 삭제
    if (req.files && req.files.length > 0) {
      await Promise.all(
        req.files.map(file => fs.unlink(file.path).catch(console.error))
      );
    }
    next(error);
  }
};

/**
 * 이미지 삭제 (선택사항)
 * 게시글 삭제 시 이미지도 함께 삭제
 */
const deleteImage = async (req, res, next) => {
  try {
    const { category, filename } = req.params;

    // 파일명 검증 (보안)
    if (!filename.match(/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp|gif)$/)) {
      throw createError(400, '잘못된 파일명입니다.');
    }

    const filePath = path.join('/var/www/static/petple/images', category, filename);

    await fs.unlink(filePath);

    return res.status(200).json({
      success: true,
      message: '이미지가 삭제되었습니다.'
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return next(createError(404, '이미지를 찾을 수 없습니다.'));
    }
    next(error);
  }
};

module.exports = {
  uploadImage,
  uploadImages,
  deleteImage,
};
