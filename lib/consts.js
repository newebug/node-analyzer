module.exports = {
  // LexemeType常量
  LexemeType: {
    TYPE_UNKNOWN:   0,  // 未知
  	TYPE_ENGLISH:   1,  // 英文
  	TYPE_ARABIC:    2,  // 数字
  	TYPE_LETTER:    3,  // 英文数字混合
  	TYPE_CNWORD:    4,  // 中文词元
  	TYPE_CNCHAR:    64, // 中文单字
  	TYPE_OTHER_CJK: 8,  // 日韩文字
  	TYPE_CNUM:      16, // 中文数词
  	TYPE_COUNT:     32, // 中文量词
  	TYPE_CQUAN:     48  // 中文数量词
  },
  CharType: {
    CHAR_USELESS:   0,
    CHAR_ARABIC:    1,
    CHAR_ENGLISH:   2,
    CHAR_CHINESE:   4,
    CHAR_OTHER_CJK: 8
  }
};