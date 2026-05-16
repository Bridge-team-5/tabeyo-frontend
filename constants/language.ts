export const languages = {
  en: {
    // Camera page
    creatingSession: "Creating session...",
    uploadingImages: "Uploading images...",
    startingAnalysis: "Starting analysis...",
    analysisError: "An error occurred. Please try again.",

    // Main page
    homeSubtitle: "Scan any menu · Get instant explanations",
    homeScanBtn: "Scan Menu",
    homeHint: "Point your camera at any restaurant menu...",

    // Result page
    showToServer: "Show this page to server!",
    home: "Home",

    // Menu page
    recommend: "Recommend for me!",
    allergy: "Allergy",
    budget: "Budget",
    numPeople: "Number of ppl",
    etc: "Etc.",
    done: "Done",
    cart: "Cart",
    order: "I want to order!",
    cartEmpty: "No items in cart",
    allergyRisks: "Allergy risks",
    total: "Total",

    // Detail page
    ingredients: "Likely Ingredients",
    allergens: "Potential Allergens",
    dietary: "Dietary",
    spiciness: "Spiciness",
    addToCart: "Add to cart",
    added: "Added!",
    notFound: "Menu item not found.",
    detailedIngredients: "Detailed ingredient info",
  },

  ko: {
    // Camera page
    creatingSession: "세션 생성 중...",
    uploadingImages: "이미지 업로드 중...",
    startingAnalysis: "분석 시작 중...",
    analysisError: "오류가 발생했습니다. 다시 시도해주세요.",

    // Main page
    homeSubtitle: "메뉴판을 스캔하고 실시간 설명을 확인하세요",
    homeScanBtn: "메뉴 스캔하기",
    homeHint: "음식점 메뉴판을 카메라 화면에 비춰주세요...",

    // Result page
    showToServer: "이 화면을 직원에게 보여주세요!",
    home: "홈",

    // Menu page
    recommend: "추천해줘!",
    allergy: "알레르기",
    budget: "예산",
    numPeople: "인원 수",
    etc: "기타",
    done: "완료",
    cart: "장바구니",
    order: "주문할게요!",
    cartEmpty: "담긴 메뉴가 없습니다",
    allergyRisks: "알레르기 위험",
    total: "합계",

    // Detail page
    ingredients: "예상 재료",
    allergens: "알레르기 위험",
    dietary: "식이 정보",
    spiciness: "매운 정도",
    addToCart: "장바구니에 추가",
    added: "추가됨!",
    notFound: "메뉴를 찾을 수 없습니다.",
    detailedIngredients: "상세 성분 정보",
  },

  ja: {
    // Camera page
    creatingSession: "セッション作成中...",
    uploadingImages: "画像アップロード中...",
    startingAnalysis: "分析開始中...",
    analysisError: "エラーが発生しました。もう一度お試しください。",

    // Main page
    homeSubtitle: "メニューをスキャンして、即時解説を確認しましょう",
    homeScanBtn: "メニューをスキャン",
    homeHint: "飲食店のメニューにカメラを向けてください...",

    // Result page
    showToServer: "この画面をスタッフに見せてください！",
    home: "ホーム",

    // Menu page
    recommend: "おすすめして！",
    allergy: "アレルギー",
    budget: "予算",
    numPeople: "人数",
    etc: "その他",
    done: "完了",
    cart: "カート",
    order: "注文したい！",
    cartEmpty: "カートは空です",
    allergyRisks: "アレルギー注意",
    total: "合計",

    // Detail page
    ingredients: "予想される食材",
    allergens: "アレルギー注意",
    dietary: "食事情報",
    spiciness: "辛さ",
    addToCart: "カートに追加",
    added: "追加済み！",
    notFound: "メニューが見つかりません。",
    detailedIngredients: "詳細な成分情報",
  },
};

export type TranslationKey = keyof typeof languages.en;