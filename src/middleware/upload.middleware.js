const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { createError } = require('../utils/error');

// 허용된 MIME 타입
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

// 허용된 확장자
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// 파일 저장 경로 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // category는 라우트에서 전달받음 (profiles, posts, pets)
    const category = req.params.category || 'misc';
    const uploadPath = path.join('/var/www/static/petple/images', category);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const category = req.params.category || 'misc';
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const uuid = uuidv4();
    const filename = `${category}_${timestamp}_${uuid}${ext}`;
    cb(null, filename);
  }
});

// 파일 필터 (MIME 타입 및 확장자 검증)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // MIME 타입 검증
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(createError(400, '지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP, GIF만 허용)'));
  }

  // 확장자 검증
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(createError(400, '지원하지 않는 파일 확장자입니다.'));
  }

  cb(null, true);
};

// multer 설정
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // 한 번에 최대 5개 파일
  }
});

// 에러 핸들링 래퍼
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(createError(400, '파일 크기는 10MB를 초과할 수 없습니다.'));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(createError(400, '한 번에 최대 5개의 파일만 업로드할 수 있습니다.'));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(createError(400, '예상하지 못한 필드명입니다.'));
    }
  }
  next(err);
};

module.exports = {
  uploadSingle: upload.single('image'),
  uploadMultiple: upload.array('images', 5),
  handleMulterError
};
