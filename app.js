/**
 * Yapay Zeka ve Ahlaki Kararlar Araştırması - Uygulama Mantığı (app.js)
 * 
 * Bu dosya deneysel akışı yönetir, süreleri milisaniye cinsinden ölçer, 
 * anket ve ek puan verilerini Google Sheets'e gönderir ve yedekleri yönetir.
 */

// --- DEFAULTS & CONFIGURATION ---
const DEFAULT_SURVEY_URL = "https://script.google.com/macros/s/AKfycbye8qXwlX3a6MQjwZL2WO4l9d4NpkFRwgf6z8GoyXxrhL_eArX43Ee8985TpnW6NO0vZw/exec";
const DEFAULT_CREDITS_URL = "https://script.google.com/macros/s/AKfycbyKhZuhcK4cY8s_t5tWd_uJ0efTEfISj47nCMjDdLyRYi6JSeEFoVvRc2srK6sf1xhlIA/exec";

// --- ÖLÇEK MADDELERİ VE YAPISI ---
const MMS_ITEMS = [
    { id: "mms_1", text: "Ahlaki karar alma sürecine girmeden önce kendime neyin önemli olduğunu sorarım." },
    { id: "mms_2", text: "Doğrudan beni etkileyen ahlaki bir çıkmazla karşı karşıya kaldığımda daha iyi bir ahlaki karar vericiyim." },
    { id: "mms_3", text: "Geçmişte ahlaki çıkmazla karşılaştığım zaman yardımcı bulduğum ahlaki ilkeleri uygulamayı denerim." },
    { id: "mms_4", text: "Ahlaki/etik kararlar vermede başarılıyım." },
    { id: "mms_5", text: "Ahlaki bir karar verirken hangi faktörlerin dikkate alınması gerektiğini bilirim." },
    { id: "mms_6", text: "Ahlaki bir karara varmadan önce olası birkaç eylem biçimini göz önüne alırım." },
    { id: "mms_7", text: "Herhangi bir ikilemde ahlaki yönleri ne zaman göz önüne getirmem gerektiğini bilirim." },
    { id: "mms_8", text: "Ahlaki karar verme sürecine girdikten sonra kendime, ahlaki bir yönergeyi başarıyla takip edip etmediğimi sorarım." },
    { id: "mms_9", text: "Bana ilginç gelen etik bir ikilemle karşı karşıya kaldığımda daha iyi bir etik karar vericiyim." },
    { id: "mms_10", text: "Ahlaki karar verirken güçlü ve zayıf yanlarımı bilirim." },
    { id: "mms_11", text: "Belirsizlik yaşadığımda durup etik bir ikilem unsurunu yeniden gözden geçiririm." },
    { id: "mms_12", text: "Karar verdikten sonra kararım üzerinde iyice düşünmeye zaman harcarım." },
    { id: "mms_13", text: "Benim için önemli olan etik bir ikilemle karşı karşıya kaldığımda daha iyi bir karar vericiyim." },
    { id: "mms_14", text: "Ahlaki bir karar vermek için gerekli olan önemli faktörleri göz önünde bulundurmayı iyi yaparım." },
    { id: "mms_15", text: "Ahlaki karar verme süreci boyunca, kullandığım ahlaki ilkenin ahlaki bir karar vermede etkili olduğundan emin olmak için periyodik olarak kontrol ederim." },
    { id: "mms_16", text: "Neyin ahlaki neyin ahlaki olmadığını bilirim." },
    { id: "mms_17", text: "Ahlaki bir çıkmazın tüm yönlerini göz önünde bulundurduğumu doğrulamak için sürekli tereddüt yaşıyorum." },
    { id: "mms_18", text: "Göz önüne almam gereken ana unsurları yıkarak etik bir ikilemi anlamaya çalışırım." },
    { id: "mms_19", text: "Umursadığım bir konuyla ilgili etik bir ikilemle karşı karşıya kaldığımda, daha iyi bir etik karar vericiyim." },
    { id: "mms_20", text: "Ahlaki karar sürecine girmeden önce ahlaki çıkmazı çözmek için normalde kullandığım ahlaki ilkenin uygunluğunu tespit ederim." }
];

const AI_LIT_ITEMS = [
    { id: "ai_lit_1", text: "Yapay zekâ uygulamalarını kullanabilirim." },
    { id: "ai_lit_2", text: "Yapay zekâ uygulamalarını hayatımı kolaylaştırmak için kullanabilirim." },
    { id: "ai_lit_3", text: "Yapay zekâyı hedeflerime ulaşmak için etkili bir şekilde kullanabilirim." },
    { id: "ai_lit_4", text: "Yapay zekayı işlerimi kolaylaştıracak şekilde kullanabiliyorum." },
    { id: "ai_lit_5", text: "Yapay zekâ ile verimli bir şekilde çalışabilirim." },
    { id: "ai_lit_6", text: "Yapay zekâ ile etkili bir şekilde iletişim kurabiliyorum." },
    { id: "ai_lit_7", text: "Yapay zekâ konusunun en önemli kavramlarını biliyorum." },
    { id: "ai_lit_8", text: "Yapay zekânın tanımını biliyorum." },
    { id: "ai_lit_9", text: "Yapay zekâ kullanmanın sınırlılıklarını ve fırsatlarını değerlendirebilirim." },
    { id: "ai_lit_10", text: "Yapay zekâ kullanımının avantajlarını ve dezavantajlarını değerlendirebilirim." },
    { id: "ai_lit_11", text: "Yapay zekâ için yeni kullanım alanları düşünebilirim." },
    { id: "ai_lit_12", text: "Yapay zekânın gelecekteki olası kullanımlarını hayal edebilirim." },
    { id: "ai_lit_13", text: "Yapay zekâ tabanlı bir uygulama ile karşı karşıya olup olmadığımı anlayabilirim." },
    { id: "ai_lit_14", text: "Yapay zekâ kullanılan cihazları diğerlerinden ayırt edebilirim." },
    { id: "ai_lit_15", text: "Bir yapay zekâyla mı yoksa \"gerçek bir insanla\" mı etkileşim kurduğumu ayırt edebilirim." },
    { id: "ai_lit_16", text: "Yapay zekâ kullanımının toplum açısından sonuçlarını değerlendirebilirim." },
    { id: "ai_lit_17", text: "Yapay zekâ tarafından sağlanan verileri kullanırken etik hususları (kullanıcı gizliliği, veri güvenliği, vb.) dikkate alabilirim." },
    { id: "ai_lit_18", text: "Yapay zekâ tabanlı uygulamaları etik sonuçlar açısından analiz edebilirim." },
    { id: "ai_lit_19", text: "Yeni yapay zekâ uygulamaları tasarlayabilirim." },
    { id: "ai_lit_20", text: "Yapay zekâ alanında yeni uygulamalar programlayabilirim." },
    { id: "ai_lit_21", text: "Yeni yapay zekâ uygulamaları geliştirebilirim." },
    { id: "ai_lit_22", text: "Bir yapay zekâ programlamak için gerekli araçları (çerçeveler, programlama dilleri vb.) seçebilirim." },
    { id: "ai_lit_23", text: "Yapay zekâyı kullanırken karşılaşabileceğim zor durumlarda becerilerime güvenebilirim." },
    { id: "ai_lit_24", text: "Yapay zekayla ilgili sorunların çoğunu kendi başıma halledebilirim." },
    { id: "ai_lit_25", text: "Yapay zekâ ile çalışırken zor ve karmaşık görevleri başarılı bir şekilde çözebilirim." },
    { id: "ai_lit_26", text: "Yapay zekâ alanındaki hızlı değişimlere rağmen her zaman güncel kalabilirim." },
    { id: "ai_lit_27", text: "Yapay zekâ uygulamalarındaki en son yenilikleri takip edebilirim." },
    { id: "ai_lit_28", text: "Yeni birçok yapay zeka uygulaması ortaya çıksa da her zaman \"güncel\" kalmayı başarabilirim." },
    { id: "ai_lit_29", text: "Yapay zekânın kararlarımda beni etkilemesine izin vermem." },
    { id: "ai_lit_30", text: "Yapay zekânın kararlarımda beni etkilemesini önleyebilirim." },
    { id: "ai_lit_31", text: "Yapay zekânın kararlarımda beni etkileyip etkilemediğini fark ederim." },
    { id: "ai_lit_32", text: "Yapay zekâ ile bir şeyler yaparken hayal kırıklığı ve kaygı gibi duygularımı kontrol altında tutabilirim." },
    { id: "ai_lit_33", text: "Yapay zekâ ile etkileşimler, beni hüsrana uğrattığında veya korkuttuğunda bununla başa çıkabilirim." },
    { id: "ai_lit_34", text: "Yapay zekâyı farklı amaçlar için kullandığımda ortaya çıkan coşkumu kontrol edebilirim." }
];

// --- DURUM YÖNETİMİ VE DEĞİŞKENLER ---
let currentStep = "welcome";
let stepStartTime = 0;

// Toplanan araştırma verileri
let sessionData = {
    // Kategori Tanımlayıcıları
    muhatap: 2, // 1: Yapay Zeka, 2: İnsan
    siralama: 2, // 1: Destekleyici -> Karşıt, 2: Karşıt -> Destekleyici

    // Dilemma 1 (Ücretsiz Yemek)
    d1_initial_choice: 0,
    d1_initial_rating: 0,
    d1_q2_conf: 50,
    d1_assigned_model: "",
    d1_chat_opened: 2,
    d1_summary: "",
    d1_final_choice: 0,
    d1_final_rating: 0,
    d1_q2_conf_final: 50,
    d1_q3_ai_influence: 50,
    d1_ai_error: 0,

    // Dilemma 2 (Yemek İsrafı / Market Hediye Kartı)
    d2_initial_choice: 0,
    d2_initial_rating: 0,
    d2_q2_conf: 50,
    d2_assigned_model: "",
    d2_chat_opened: 2,
    d2_summary: "",
    d2_final_choice: 0,
    d2_final_rating: 0,
    d2_q2_conf_final: 50,
    d2_q3_ai_influence: 50,
    d2_ai_error: 0,

    // Ölçekler & Demografik (JSON String olarak gönderilecek)
    mms_answers: {},
    ai_lit_answers: {},
    demo_age: 0,
    demo_gender: 0,
    demo_ses: 0,
    demo_ai_used: 0,
    demo_ai_preferred: 0,
    demo_religiosity: 4,
    demo_politics: 4,
    demo_trust_human: 50,
    demo_trust_ai: 50,
    demo_ai_duration: 0,
    demo_ai_hours: 0,
    demo_ai_understanding: 4,
    demo_source_trust: 4,
    demo_source_future_intent: 4,
    demo_ai_believability: 4
};

// Sayfa adımlarının progress sırası
const STEP_ORDER = ["welcome", "instructions-d1", "d1-init", "d1-ai", "d1-post", "instructions-d2", "d2-init", "d2-ai", "d2-post", "scales", "debrief"];

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    // Sayfa açıldığında başlangıç zamanını kaydet
    stepStartTime = Date.now();
    
    // UI Event Listeners'ları kur
    initAppNavigation();
    
    // Ölçek maddelerini oluştur
    renderMmsQuestions();
    renderAiLitQuestions();
    
    // URL parametresinde admin varsa veya şifre girilirse admin panelini başlat
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('admin')) {
        showAdminModal();
    }

    // Aktif oturum varsa geri yükle (iPhone/Safari sekme yenilenme koruması)
    restoreSurveySession();
});

// --- UI GÜNCELLEME VE NAVİGASYON ---
function showStep(stepId) {
    // Aktif kartı gizle, yenisini göster
    document.querySelectorAll(".card").forEach(card => card.classList.remove("active"));
    const targetCard = document.getElementById(`view-${stepId}`);
    if (targetCard) {
        targetCard.classList.add("active");
    }

    currentStep = stepId;

    // Progress Bar güncelle
    updateProgressBar(stepId);
    
    // Sayfayı üste kaydır
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Sayfa durumunu hafızaya kaydet (iPhone/Safari koruması)
    saveSurveySession();
}

function updateProgressBar(stepId) {
    const progressContainer = document.getElementById("progress-container");
    if (!progressContainer) return;

    const index = STEP_ORDER.indexOf(stepId);
    if (index === -1) {
        // Eğer aşamalardan bağımsız bir ekrandaysak (student-info, thanks, admin) progress barı gizle
        progressContainer.style.display = "none";
        return;
    } else {
        progressContainer.style.display = "block";
    }

    // Yüzdeyi hesapla
    const percent = (index / (STEP_ORDER.length - 1)) * 100;
    document.getElementById("progress-bar").style.width = `${percent}%`;

    // Noktaları güncelle
    const dots = document.querySelectorAll(".step-dot");
    dots.forEach((dot, idx) => {
        dot.classList.remove("active", "completed");
        if (idx === index) {
            dot.classList.add("active");
        } else if (idx < index) {
            dot.classList.add("completed");
        }
    });
}

// Gerekli tüm elementleri seçip tıklama olaylarını bağlar
function initAppNavigation() {
    // 1. Welcome Screen
    const btnConsentNext = document.getElementById("btn-start") || document.getElementById("btn-consent-next");
    const consentCheck = document.getElementById("consent-check");
    
    if (consentCheck && btnConsentNext) {
        consentCheck.addEventListener("change", () => {
            btnConsentNext.disabled = !consentCheck.checked;
        });
    }

    if (btnConsentNext) {
        btnConsentNext.addEventListener("click", () => {
            showStep("instructions-d1");
        });
    }

    // 1b. Study Instructions Screen 1
    const btnInstructionsD1Next = document.getElementById("btn-instructions-d1-next");
    if (btnInstructionsD1Next) {
        btnInstructionsD1Next.addEventListener("click", () => {
            showStep("d1-init");
        });
    }

    // 2. Dilemma 1 Initial Choice Validation
    const d1ChoiceRadios = document.querySelectorAll("input[name='d1-init-choice']");
    const d1RatingRadios = document.querySelectorAll("input[name='d1-init-rating']");
    const btnD1InitNext = document.getElementById("btn-d1-init-next");

    function validateD1Init() {
        const choiceChecked = document.querySelector("input[name='d1-init-choice']:checked");
        const ratingChecked = document.querySelector("input[name='d1-init-rating']:checked");
        btnD1InitNext.disabled = !(choiceChecked && ratingChecked);
    }
    
    d1ChoiceRadios.forEach(radio => radio.addEventListener("change", validateD1Init));
    d1RatingRadios.forEach(radio => radio.addEventListener("change", validateD1Init));

    // Sliders Real-time updates
    setupSliderListener("d1-init-q2-conf", "val-d1-init-q2", (val) => sessionData.d1_q2_conf = parseInt(val));

    btnD1InitNext.addEventListener("click", () => {
        const choiceVal = document.querySelector("input[name='d1-init-choice']:checked").value;
        sessionData.d1_initial_choice = parseInt(choiceVal);
        sessionData.d1_initial_rating = parseInt(document.querySelector("input[name='d1-init-rating']:checked").value);
        
        // KARŞIT ATAMA MANTIĞI (KARŞIT İLK):
        // 1: Evet (İsrafı önle -> Karşıtı: wstflh), 2: Hayır (Eşitliği koru -> Karşıtı: unfrnsh)
        const chatLink1 = document.getElementById("btn-d1-chat-link");
        if (sessionData.d1_initial_choice === 1 || choiceVal === "1" || choiceVal === "Evet") {
            sessionData.d1_assigned_model = "wstflh";
            if (chatLink1) chatLink1.href = "https://mocolabtester.github.io/wstflh/";
        } else {
            sessionData.d1_assigned_model = "unfrnsh";
            if (chatLink1) chatLink1.href = "https://mocolabtester.github.io/unfrnsh/";
        }

        showStep("d1-ai");
    });

    // 3. AI Redirect 1
    const linkD1Chat = document.getElementById("btn-d1-chat-link");
    const btnD1AiDone = document.getElementById("btn-d1-ai-done");

    if (linkD1Chat && btnD1AiDone) {
        linkD1Chat.addEventListener("click", () => {
            if (sessionData.d1_chat_opened !== 1) {
                sessionData.d1_chat_opened = 1;
                btnD1AiDone.disabled = false;
            }
        });
    }

    if (btnD1AiDone) {
        btnD1AiDone.addEventListener("click", () => {
            showStep("d1-post");
        });
    }

    // 4. Dilemma 1 Post
    const d1SummaryText = document.getElementById("d1-summary-text");
    const d1SummaryCount = document.getElementById("d1-summary-count");
    const d1PostChoiceRadios = document.querySelectorAll("input[name='d1-post-choice']");
    const d1PostRatingRadios = document.querySelectorAll("input[name='d1-post-rating']");
    const d1AiErrorRadios = document.querySelectorAll("input[name='d1-ai-error']");
    const btnD1PostNext = document.getElementById("btn-d1-post-next");

    function validateD1Post() {
        const choiceChecked = document.querySelector("input[name='d1-post-choice']:checked");
        const ratingChecked = document.querySelector("input[name='d1-post-rating']:checked");
        const errorChecked = document.querySelector("input[name='d1-ai-error']:checked");

        let textValid = true;
        const textVal = d1SummaryText.value.trim();

        if (errorChecked && (errorChecked.value === "2" || errorChecked.value === "Hayır")) {
            textValid = textVal.length >= 20;
            d1SummaryCount.style.display = "block";
            d1SummaryCount.innerText = `${textVal.length} / 20 karakter (minimum)`;
            if (textValid) {
                d1SummaryCount.classList.add("success");
            } else {
                d1SummaryCount.classList.remove("success");
            }
        } else {
            d1SummaryCount.style.display = "none";
        }

        btnD1PostNext.disabled = !(choiceChecked && ratingChecked && errorChecked && textValid);
    }

    d1SummaryText.addEventListener("input", validateD1Post);
    d1PostChoiceRadios.forEach(radio => radio.addEventListener("change", validateD1Post));
    d1PostRatingRadios.forEach(radio => radio.addEventListener("change", validateD1Post));
    d1AiErrorRadios.forEach(radio => radio.addEventListener("change", validateD1Post));

    setupSliderListener("d1-post-q2-conf", "val-d1-post-q2", (val) => sessionData.d1_q2_conf_final = parseInt(val));
    setupSliderListener("d1-post-q3-influence", "val-d1-post-q3", (val) => sessionData.d1_q3_ai_influence = parseInt(val));

    const btnD1AiBack = document.getElementById("btn-d1-ai-back");
    if (btnD1AiBack) {
        btnD1AiBack.addEventListener("click", () => showStep("d1-init"));
    }

    const d1AiReadyCheck = document.getElementById("d1-ai-ready-check");
    const btnD1ChatLink = document.getElementById("btn-d1-chat-link");
    if (d1AiReadyCheck && btnD1ChatLink) {
        d1AiReadyCheck.addEventListener("change", () => {
            if (d1AiReadyCheck.checked) {
                btnD1ChatLink.classList.remove("disabled-link");
            } else {
                btnD1ChatLink.classList.add("disabled-link");
            }
        });
    }

    const btnD1PostBack = document.getElementById("btn-d1-post-back");
    if (btnD1PostBack) {
        btnD1PostBack.addEventListener("click", () => showStep("d1-ai"));
    }

    btnD1PostNext.addEventListener("click", () => {
        sessionData.d1_summary = d1SummaryText.value.trim();
        sessionData.d1_final_choice = parseInt(document.querySelector("input[name='d1-post-choice']:checked").value);
        sessionData.d1_final_rating = parseInt(document.querySelector("input[name='d1-post-rating']:checked").value);
        sessionData.d1_ai_error = parseInt(document.querySelector("input[name='d1-ai-error']:checked").value);
        showStep("instructions-d2");
    });

    // 4b. Study Instructions Screen 2
    const btnInstructionsD2Next = document.getElementById("btn-instructions-d2-next");
    if (btnInstructionsD2Next) {
        btnInstructionsD2Next.addEventListener("click", () => {
            showStep("d2-init");
        });
    }

    // 5. Dilemma 2 Initial
    const d2ChoiceRadios = document.querySelectorAll("input[name='d2-init-choice']");
    const d2RatingRadios = document.querySelectorAll("input[name='d2-init-rating']");
    const btnD2InitNext = document.getElementById("btn-d2-init-next");

    function validateD2Init() {
        const choiceChecked = document.querySelector("input[name='d2-init-choice']:checked");
        const ratingChecked = document.querySelector("input[name='d2-init-rating']:checked");
        btnD2InitNext.disabled = !(choiceChecked && ratingChecked);
    }
    
    d2ChoiceRadios.forEach(radio => radio.addEventListener("change", validateD2Init));
    d2RatingRadios.forEach(radio => radio.addEventListener("change", validateD2Init));

    setupSliderListener("d2-init-q2-conf", "val-d2-init-q2", (val) => sessionData.d2_q2_conf = parseInt(val));

    btnD2InitNext.addEventListener("click", () => {
        const choiceVal = document.querySelector("input[name='d2-init-choice']:checked").value;
        sessionData.d2_initial_choice = parseInt(choiceVal);
        sessionData.d2_initial_rating = parseInt(document.querySelector("input[name='d2-init-rating']:checked").value);
        
        // DESTEKLEYİCİ İNSAN (Katılımcının İkilem 2'deki kararına kesinlikle DESTEKLEYİCİ model atanır):
        // 1: Evet (İsrafı önle -> Destekleyen: unfrnsh), 2: Hayır (Eşitliği koru -> Destekleyen: wstflh)
        const chatLink2 = document.getElementById("btn-d2-chat-link");
        if (sessionData.d2_initial_choice === 1 || choiceVal === "1" || choiceVal === "Evet") {
            sessionData.d2_assigned_model = "unfrnsh";
            if (chatLink2) chatLink2.href = "https://mocolabtester.github.io/unfrnsh/";
        } else {
            sessionData.d2_assigned_model = "wstflh";
            if (chatLink2) chatLink2.href = "https://mocolabtester.github.io/wstflh/";
        }

        showStep("d2-ai");
    });

    // 6. AI Redirect 2 (Conflicting AI)
    const linkD2Chat = document.getElementById("btn-d2-chat-link");
    const btnD2AiDone = document.getElementById("btn-d2-ai-done");

    if (linkD2Chat && btnD2AiDone) {
        linkD2Chat.addEventListener("click", () => {
            if (sessionData.d2_chat_opened !== 1) {
                sessionData.d2_chat_opened = 1;
                btnD2AiDone.disabled = false;
            }
        });
    }

    if (btnD2AiDone) {
        btnD2AiDone.addEventListener("click", () => {
            showStep("d2-post");
        });
    }

    // 7. Dilemma 2 Post
    const d2SummaryText = document.getElementById("d2-summary-text");
    const d2SummaryCount = document.getElementById("d2-summary-count");
    const d2PostChoiceRadios = document.querySelectorAll("input[name='d2-post-choice']");
    const d2PostRatingRadios = document.querySelectorAll("input[name='d2-post-rating']");
    const d2AiErrorRadios = document.querySelectorAll("input[name='d2-ai-error']");
    const btnD2PostNext = document.getElementById("btn-d2-post-next");

    function validateD2Post() {
        const choiceChecked = document.querySelector("input[name='d2-post-choice']:checked");
        const ratingChecked = document.querySelector("input[name='d2-post-rating']:checked");
        const errorChecked = document.querySelector("input[name='d2-ai-error']:checked");

        let textValid = true;
        const textVal = d2SummaryText.value.trim();

        if (errorChecked && (errorChecked.value === "2" || errorChecked.value === "Hayır")) {
            textValid = textVal.length >= 20;
            d2SummaryCount.style.display = "block";
            d2SummaryCount.innerText = `${textVal.length} / 20 karakter (minimum)`;
            if (textValid) {
                d2SummaryCount.classList.add("success");
            } else {
                d2SummaryCount.classList.remove("success");
            }
        } else {
            d2SummaryCount.style.display = "none";
        }

        btnD2PostNext.disabled = !(choiceChecked && ratingChecked && errorChecked && textValid);
    }

    d2SummaryText.addEventListener("input", validateD2Post);
    d2PostChoiceRadios.forEach(radio => radio.addEventListener("change", validateD2Post));
    d2PostRatingRadios.forEach(radio => radio.addEventListener("change", validateD2Post));
    d2AiErrorRadios.forEach(radio => radio.addEventListener("change", validateD2Post));

    setupSliderListener("d2-post-q2-conf", "val-d2-post-q2", (val) => sessionData.d2_q2_conf_final = parseInt(val));
    setupSliderListener("d2-post-q3-influence", "val-d2-post-q3", (val) => sessionData.d2_q3_ai_influence = parseInt(val));

    const btnD2AiBack = document.getElementById("btn-d2-ai-back");
    if (btnD2AiBack) {
        btnD2AiBack.addEventListener("click", () => showStep("d2-init"));
    }

    const d2AiReadyCheck = document.getElementById("d2-ai-ready-check");
    const btnD2ChatLink = document.getElementById("btn-d2-chat-link");
    if (d2AiReadyCheck && btnD2ChatLink) {
        d2AiReadyCheck.addEventListener("change", () => {
            if (d2AiReadyCheck.checked) {
                btnD2ChatLink.classList.remove("disabled-link");
            } else {
                btnD2ChatLink.classList.add("disabled-link");
            }
        });
    }

    const btnD2PostBack = document.getElementById("btn-d2-post-back");
    if (btnD2PostBack) {
        btnD2PostBack.addEventListener("click", () => showStep("d2-ai"));
    }

    btnD2PostNext.addEventListener("click", () => {
        sessionData.d2_summary = d2SummaryText.value.trim();
        sessionData.d2_final_choice = parseInt(document.querySelector("input[name='d2-post-choice']:checked").value);
        sessionData.d2_final_rating = parseInt(document.querySelector("input[name='d2-post-rating']:checked").value);
        sessionData.d2_ai_error = parseInt(document.querySelector("input[name='d2-ai-error']:checked").value);
        showStep("scales");
    });

    // 8. Scales Navigation Tab Buttons
    const tabMms = document.getElementById("tab-mms");
    const tabAiLit = document.getElementById("tab-ai-lit");
    const tabDemo = document.getElementById("tab-demographics");

    tabMms.addEventListener("click", () => switchScaleTab("mms"));
    tabAiLit.addEventListener("click", () => switchScaleTab("ai-lit"));
    tabDemo.addEventListener("click", () => switchScaleTab("demographics"));

    const btnMmsNext = document.getElementById("btn-mms-next");
    const btnAiLitNext = document.getElementById("btn-ai-lit-next");
    const btnDemoNext = document.getElementById("btn-demographics-next");

    btnMmsNext.addEventListener("click", () => {
        if (validateMmsAnswers()) {
            tabAiLit.disabled = false;
            switchScaleTab("ai-lit");
        } else {
            alert("Lütfen Ölçek 1'deki tüm maddeleri yanıtlayınız.");
        }
    });

    btnAiLitNext.addEventListener("click", () => {
        if (validateAiLitAnswers()) {
            tabDemo.disabled = false;
            switchScaleTab("demographics");
        } else {
            alert("Lütfen Ölçek 2'deki tüm maddeleri yanıtlayınız.");
        }
    });

    setupSliderListener("demo-religiosity", "val-demo-rel", (val) => {
        const optout = document.getElementById("demo-rel-optout");
        if (!optout || !optout.checked) {
            sessionData.demo_religiosity = parseInt(val);
        }
    });

    setupSliderListener("demo-politics", "val-demo-pol", (val) => {
        const optout = document.getElementById("demo-pol-optout");
        if (!optout || !optout.checked) {
            sessionData.demo_politics = parseInt(val);
        }
    });

    setupSliderListener("demo-trust-human", "val-demo-trust-human", (val) => sessionData.demo_trust_human = parseInt(val));
    setupSliderListener("demo-trust-ai", "val-demo-trust-ai", (val) => sessionData.demo_trust_ai = parseInt(val));

    const relOptout = document.getElementById("demo-rel-optout");
    const relSlider = document.getElementById("demo-religiosity");
    const valRel = document.getElementById("val-demo-rel");
    if (relOptout && relSlider && valRel) {
        relOptout.addEventListener("change", () => {
            if (relOptout.checked) {
                relSlider.disabled = true;
                relSlider.closest(".slider-container").style.opacity = "0.4";
                valRel.innerText = "-";
                sessionData.demo_religiosity = 0;
            } else {
                relSlider.disabled = false;
                relSlider.closest(".slider-container").style.opacity = "1";
                valRel.innerText = relSlider.value;
                sessionData.demo_religiosity = parseInt(relSlider.value);
            }
        });
    }

    const polOptout = document.getElementById("demo-pol-optout");
    const polSlider = document.getElementById("demo-politics");
    const valPol = document.getElementById("val-demo-pol");
    if (polOptout && polSlider && valPol) {
        polOptout.addEventListener("change", () => {
            if (polOptout.checked) {
                polSlider.disabled = true;
                polSlider.closest(".slider-container").style.opacity = "0.4";
                valPol.innerText = "-";
                sessionData.demo_politics = 0;
            } else {
                polSlider.disabled = false;
                polSlider.closest(".slider-container").style.opacity = "1";
                valPol.innerText = polSlider.value;
                sessionData.demo_politics = parseInt(polSlider.value);
            }
        });
    }

    btnDemoNext.addEventListener("click", () => {
        if (validateDemographics()) {
            submitSurveyData();
        }
    });

    // 9. Debrief & Final Submit
    const btnDebriefSubmit = document.getElementById("btn-debrief-submit");
    if (btnDebriefSubmit) {
        btnDebriefSubmit.addEventListener("click", () => {
            showStep("student-info");
        });
    }

    // 10. Student Credits Info
    const btnStudentSubmit = document.getElementById("btn-student-submit");
    if (btnStudentSubmit) {
        btnStudentSubmit.addEventListener("click", () => {
            submitStudentInfo();
        });
    }

    const btnStudentSkip = document.getElementById("btn-student-skip");
    if (btnStudentSkip) {
        btnStudentSkip.addEventListener("click", () => {
            showStep("thanks");
        });
    }

    // 11. Secret Admin Triggers
    const secretTrigger = document.getElementById("trigger-admin-login");
    const adminModal = document.getElementById("admin-modal");
    const btnCloseModal = document.getElementById("btn-close-modal");
    const btnModalCancel = document.getElementById("btn-modal-cancel");
    const btnModalLogin = document.getElementById("btn-modal-login");
    const adminPassInput = document.getElementById("admin-pass");
    const adminLoginError = document.getElementById("admin-login-error");

    if (secretTrigger) secretTrigger.addEventListener("click", showAdminModal);
    if (btnCloseModal) btnCloseModal.addEventListener("click", hideAdminModal);
    if (btnModalCancel) btnModalCancel.addEventListener("click", hideAdminModal);
    
    if (btnModalLogin) {
        btnModalLogin.addEventListener("click", () => {
            if (adminPassInput && adminPassInput.value === "moralmetacognition2026") {
                hideAdminModal();
                showStep("admin");
                initAdminPanel();
            } else {
                if (adminLoginError) adminLoginError.innerText = "Hatalı şifre!";
            }
        });
    }

    if (adminPassInput) {
        adminPassInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && btnModalLogin) {
                btnModalLogin.click();
            }
        });
    }

    const btnAdminLogout = document.getElementById("btn-admin-logout");
    if (btnAdminLogout) {
        btnAdminLogout.addEventListener("click", () => {
            showStep("welcome");
        });
    }
}

function setupSliderListener(sliderId, valueId, callback) {
    const slider = document.getElementById(sliderId);
    const valueEl = document.getElementById(valueId);
    if (slider && valueEl) {
        slider.addEventListener("input", (e) => {
            const val = e.target.value;
            valueEl.innerText = val;
            if (callback) callback(val);
        });
    }
}

// --- DYNAMIC SCALE RENDERERS ---
function renderMmsQuestions() {
    const container = document.getElementById("mms-questions-container");
    if (!container) return;
    container.innerHTML = "";

    MMS_ITEMS.forEach((item, index) => {
        const itemCard = document.createElement("div");
        itemCard.className = "scale-item-card";
        
        itemCard.innerHTML = `
            <div class="scale-item-text required">${index + 1}. ${item.text}</div>
            <div class="scale-item-row-options">
                ${[1, 2, 3, 4, 5, 6].map(num => `
                    <label class="scale-option-bubble">
                        <input type="radio" name="ans-${item.id}" value="${num}">
                        <span>
                            <span class="option-num">${num}</span>
                            <span class="option-text">${getMmsLikertText(num)}</span>
                        </span>
                    </label>
                `).join('')}
            </div>
        `;
        container.appendChild(itemCard);
    });
}

function getMmsLikertText(num) {
    switch (num) {
        case 1: return "Kesinlikle Katılmıyorum";
        case 2: return "Katılmıyorum";
        case 3: return "Kısmen Katılmıyorum";
        case 4: return "Kısmen Katılıyorum";
        case 5: return "Katılıyorum";
        case 6: return "Kesinlikle Katılıyorum";
        default: return "";
    }
}

function renderAiLitQuestions() {
    const container = document.getElementById("ai-lit-questions-container");
    if (!container) return;
    container.innerHTML = "";

    AI_LIT_ITEMS.forEach((item, index) => {
        const itemCard = document.createElement("div");
        itemCard.className = "scale-item-card";
        
        itemCard.innerHTML = `
            <div class="scale-item-text required">${index + 1}. ${item.text}</div>
            <div class="likert-labels mails-labels">
                <span>0 (Hiç belirgin değil)</span>
                <span>10 (Çok belirgin)</span>
            </div>
            <div class="scale-item-row-options mails-grid">
                ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => `
                    <label class="scale-option-bubble mails-bubble">
                        <input type="radio" name="ans-${item.id}" value="${num}">
                        <span>
                            <span class="option-num">${num}</span>
                        </span>
                    </label>
                `).join('')}
            </div>
        `;
        container.appendChild(itemCard);
    });
}

// --- SCALE VALIDATIONS ---
function switchScaleTab(tabId) {
    document.querySelectorAll(".scale-tab").forEach(tab => tab.classList.remove("active"));
    document.querySelectorAll(".scale-content-pane").forEach(pane => pane.classList.remove("active"));
    
    document.getElementById(`tab-${tabId}`).classList.add("active");
    document.getElementById(`scale-content-${tabId}`).classList.add("active");
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateMmsAnswers() {
    let allAnswered = true;
    MMS_ITEMS.forEach(item => {
        const checked = document.querySelector(`input[name="ans-${item.id}"]:checked`);
        if (!checked) {
            allAnswered = false;
        } else {
            sessionData.mms_answers[item.id] = parseInt(checked.value);
        }
    });
    return allAnswered;
}

function validateAiLitAnswers() {
    let allAnswered = true;
    AI_LIT_ITEMS.forEach(item => {
        const checked = document.querySelector(`input[name="ans-${item.id}"]:checked`);
        if (!checked) {
            allAnswered = false;
        } else {
            sessionData.ai_lit_answers[item.id] = parseInt(checked.value);
        }
    });
    return allAnswered;
}

function validateDemographics() {
    // Önceki hata vurgularını temizle
    document.querySelectorAll(".has-error").forEach(el => el.classList.remove("has-error"));
    document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));

    const errors = [];
    let firstErrorElement = null;

    function addError(element, container, message) {
        if (element) element.classList.add("input-error");
        if (container) container.classList.add("has-error");
        if (!firstErrorElement) firstErrorElement = element || container;
        errors.push(message);
    }

    // 1. Yaş
    const ageInput = document.getElementById("demo-age");
    const ageVal = ageInput.value.trim();
    const ageNum = parseInt(ageVal, 10);
    if (!ageVal || isNaN(ageNum) || ageNum < 15 || ageNum > 100) {
        addError(ageInput, ageInput.closest(".form-group"), "Lütfen yaşınızı geçerli bir sayı olarak giriniz (15-100).");
    }

    // Cinsiyet (isteğe bağlı)
    const genderVal = document.getElementById("demo-gender").value;

    // 2. Sosyo-ekonomik Durum
    const sesSelect = document.getElementById("demo-ses");
    const sesVal = sesSelect.value;
    if (!sesVal) {
        addError(sesSelect, sesSelect.closest(".form-group"), "Lütfen sosyo-ekonomik durumunuzu seçiniz.");
    }

    // 3. Yapay Zeka Kullandınız mı?
    const aiUsedChecked = document.querySelector("input[name='demo-ai-used']:checked");
    const aiUsedGroup = document.querySelector("input[name='demo-ai-used']") ? document.querySelector("input[name='demo-ai-used']").closest(".form-group") : null;
    if (!aiUsedChecked) {
        addError(null, aiUsedGroup, "Lütfen daha önce yapay zeka kullanıp kullanmadığınızı belirtiniz.");
    }

    const doesNotUseAI = aiUsedChecked && aiUsedChecked.value === "2"; // Hayır

    // 4. En sık kullanılan araç
    const aiPrefSelect = document.getElementById("demo-ai-preferred");
    let aiPreferredVal = aiPrefSelect.value;
    if (!aiPreferredVal) {
        if (doesNotUseAI) {
            aiPreferredVal = "5"; // 'Yapay Zeka Kullanmıyorum' otomatik seç
            aiPrefSelect.value = "5";
        } else {
            addError(aiPrefSelect, aiPrefSelect.closest(".form-group"), "Lütfen en sık kullandığınız yapay zeka aracını seçiniz.");
        }
    }

    // 5. Kullanım süresi
    const durationSelect = document.getElementById("demo-ai-duration");
    let durationVal = durationSelect.value;
    if (!durationVal) {
        if (doesNotUseAI) {
            durationVal = "1"; // 'Hiç kullanmadım' otomatik seç
            durationSelect.value = "1";
        } else {
            addError(durationSelect, durationSelect.closest(".form-group"), "Lütfen ne kadar süredir yapay zeka kullandığınızı seçiniz.");
        }
    }

    // 6. Haftalık kullanım saati
    const hoursInput = document.getElementById("demo-ai-hours");
    let hoursRaw = hoursInput.value.trim().replace(',', '.');
    if (hoursRaw === "" && (doesNotUseAI || durationVal === "1")) {
        hoursRaw = "0";
        hoursInput.value = "0";
    }
    const hoursNum = parseFloat(hoursRaw);
    if (hoursRaw === "" || isNaN(hoursNum) || hoursNum < 0) {
        addError(hoursInput, hoursInput.closest(".form-group"), "Lütfen haftalık yapay zeka kullanım saatinizi giriniz (kullanmıyorsanız 0 yazınız).");
    }

    // 7. Cevapların açıklığı (1-7)
    const aiUnderstandingChecked = document.querySelector("input[name='demo-ai-understanding']:checked");
    const aiUndGroup = document.querySelector("input[name='demo-ai-understanding']") ? document.querySelector("input[name='demo-ai-understanding']").closest(".form-group") : null;
    if (!aiUnderstandingChecked) {
        addError(null, aiUndGroup, "Lütfen 'Cevapların açıklığı ve anlaşılırlığı' sorusunu yanıtlayınız.");
    }

    // 8. Kaynağa güven (1-7)
    const sourceTrustChecked = document.querySelector("input[name='demo-source-trust']:checked");
    const srcTrustGroup = document.querySelector("input[name='demo-source-trust']") ? document.querySelector("input[name='demo-source-trust']").closest(".form-group") : null;
    if (!sourceTrustChecked) {
        addError(null, srcTrustGroup, "Lütfen 'Danıştığınız kaynağı ne kadar güvenilir buldunuz?' sorusunu yanıtlayınız.");
    }

    // 9. Gelecekte danışma isteği (1-7)
    const futureIntentChecked = document.querySelector("input[name='demo-source-future-intent']:checked");
    const futIntentGroup = document.querySelector("input[name='demo-source-future-intent']") ? document.querySelector("input[name='demo-source-future-intent']").closest(".form-group") : null;
    if (!futureIntentChecked) {
        addError(null, futIntentGroup, "Lütfen 'Bu kaynağa farklı konularda da danışma isteği' sorusunu yanıtlayınız.");
    }

    // 10. Sohbetin inandırıcılığı (1-7)
    const believabilityChecked = document.querySelector("input[name='demo-ai-believability']:checked");
    const believGroup = document.querySelector("input[name='demo-ai-believability']") ? document.querySelector("input[name='demo-ai-believability']").closest(".form-group") : null;
    if (!believabilityChecked) {
        addError(null, believGroup, "Lütfen 'Yaptığınız sohbetin içeriğini ne kadar inandırıcı buldunuz?' sorusunu yanıtlayınız.");
    }

    // Hata varsa kullanıcıyı eksik soruya kaydır ve uyar
    if (errors.length > 0) {
        if (firstErrorElement) {
            firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (typeof firstErrorElement.focus === 'function') {
                firstErrorElement.focus();
            }
        }
        alert("Lütfen aşağıdaki eksik soruyu tamamlayınız:\n\n• " + errors[0]);
        return false;
    }

    // Başarılıysa sessionData'ya kaydet
    sessionData.demo_age = ageNum;
    sessionData.demo_gender = genderVal ? parseInt(genderVal) : 0;
    sessionData.demo_ses = parseInt(sesVal);
    sessionData.demo_ai_used = parseInt(aiUsedChecked.value);
    sessionData.demo_ai_preferred = parseInt(aiPreferredVal);
    sessionData.demo_ai_duration = parseInt(durationVal);
    sessionData.demo_ai_hours = hoursNum;
    sessionData.demo_ai_understanding = parseInt(aiUnderstandingChecked.value);
    sessionData.demo_source_trust = parseInt(sourceTrustChecked.value);
    sessionData.demo_source_future_intent = parseInt(futureIntentChecked.value);
    sessionData.demo_ai_believability = parseInt(believabilityChecked.value);

    return true;
}

// --- DATA SUBMISSIONS (GOOGLE SHEETS INTEGRATION) ---
function submitSurveyData() {
    // 1. Önce LocalStorage'da yedekleyelim (Çevrimdışı koruma)
    const localSurveys = JSON.parse(localStorage.getItem("survey_responses") || "[]");
    
    // Anket verisi nesnesine zaman damgası ekle
    const submission = {
        timestamp: new Date().toISOString(),
        ...sessionData
    };
    
    localSurveys.push(submission);
    localStorage.setItem("survey_responses", JSON.stringify(localSurveys));

    // 2. Google E-Tablo URL'si yapılandırılmışsa veya varsayılan varsa sunucuya gönder
    const surveyUrl = localStorage.getItem("api_survey_url") || DEFAULT_SURVEY_URL;
    
    if (surveyUrl && surveyUrl.trim() !== "") {
        // Hazırlanan düzleştirilmiş veriyi yollayalım
        const flatData = flattenDataForSheets(submission);
        
        fetch(surveyUrl, {
            method: "POST",
            mode: "no-cors", // CORS engellerini aşmak için Apps Script ile standart en güvenli yol
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(flatData)
        })
        .then(() => {
            console.log("Veri Google Sheets'e başarıyla postalandı.");
        })
        .catch(err => {
            console.error("Google Sheets'e gönderim hatası (Yedek yerel bellekte saklandı):", err);
        });
    }

    // Katılımcıyı Debriefing sayfasına aktar
    showStep("debrief");
}

function submitStudentInfo() {
    const nameVal = document.getElementById("stud-name").value.trim();
    const idVal = document.getElementById("stud-id").value.trim();
    const courseVal = document.getElementById("stud-course").value.trim();

    if (!nameVal || !idVal || !courseVal) {
        alert("Lütfen ek puan alabilmek için tüm alanları doldurunuz.");
        return;
    }

    // 1. LocalStorage yedeği
    const localCredits = JSON.parse(localStorage.getItem("student_credits") || "[]");
    const creditSubmission = {
        timestamp: new Date().toISOString(),
        student_name: nameVal,
        student_id: idVal,
        course_name: courseVal
    };
    localCredits.push(creditSubmission);
    localStorage.setItem("student_credits", JSON.stringify(localCredits));

    // 2. Google Sheets gönderimi
    const creditsUrl = localStorage.getItem("api_credits_url") || DEFAULT_CREDITS_URL;
    if (creditsUrl && creditsUrl.trim() !== "") {
        fetch(creditsUrl, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(creditSubmission)
        })
        .then(() => {
            console.log("Öğrenci bilgileri Google Sheets'e postalandı.");
        })
        .catch(err => {
            console.error("Öğrenci kaydı gönderme hatası:", err);
        });
    }

    // Teşekkür sayfasına aktar
    showStep("thanks");
}

// Google Sheets'e gönderilmek üzere iç içe geçmiş nesneleri düzleştirir (Flattening)
function flattenDataForSheets(obj) {
    const flat = {};
    
    for (const key in obj) {
        if (key === "mms_answers") {
            // mms_1: 4, mms_2: 5 şeklinde düzleştir
            for (const subKey in obj[key]) {
                flat[subKey] = obj[key][subKey];
            }
        } else if (key === "ai_lit_answers") {
            // ai_lit_1: 3 şeklinde düzleştir
            for (const subKey in obj[key]) {
                flat[subKey] = obj[key][subKey];
            }
        } else {
            flat[key] = obj[key];
        }
    }
    
    return flat;
}

// --- ADMIN PANEL FUNCTIONS ---
function showAdminModal() {
    const modal = document.getElementById("admin-modal");
    const adminPassInput = document.getElementById("admin-pass");
    const adminLoginError = document.getElementById("admin-login-error");
    
    adminPassInput.value = "";
    adminLoginError.innerText = "";
    
    if (modal) modal.classList.add("active");
    adminPassInput.focus();
}

function hideAdminModal() {
    const modal = document.getElementById("admin-modal");
    if (modal) modal.classList.remove("active");
}

function initAdminPanel() {
    // API URL değerlerini veya varsayılanları inputlara yükle
    document.getElementById("config-survey-url").value = localStorage.getItem("api_survey_url") || DEFAULT_SURVEY_URL;
    document.getElementById("config-credits-url").value = localStorage.getItem("api_credits_url") || DEFAULT_CREDITS_URL;

    // İstatistikleri güncelle
    const surveysCount = JSON.parse(localStorage.getItem("survey_responses") || "[]").length;
    document.getElementById("admin-count-local").innerText = surveysCount;

    const surveyUrl = localStorage.getItem("api_survey_url") || DEFAULT_SURVEY_URL;
    const creditsUrl = localStorage.getItem("api_credits_url") || DEFAULT_CREDITS_URL;
    const hasSurvey = surveyUrl.trim() !== "";
    const hasCredits = creditsUrl.trim() !== "";
    const statusEl = document.getElementById("admin-sheet-status");
    if (hasSurvey && hasCredits) {
        statusEl.innerText = "Aktif (Google Sheets Bağlı)";
        statusEl.className = "stat-value text-success";
    } else {
        statusEl.innerText = "Yapılandırılmadı (Yalnızca Yerel Kayıt)";
        statusEl.className = "stat-value text-danger";
    }

    // QR kodu oluştur
    generateAppQRCode();

    // Admin Panel listeners
    const btnSaveConfig = document.getElementById("btn-save-config");
    btnSaveConfig.onclick = () => {
        const sUrl = document.getElementById("config-survey-url").value.trim();
        const cUrl = document.getElementById("config-credits-url").value.trim();
        
        localStorage.setItem("api_survey_url", sUrl);
        localStorage.setItem("api_credits_url", cUrl);
        alert("Bağlantı ayarları tarayıcınıza kaydedildi.");
        initAdminPanel(); // Refresh status
    };

    // CSV Download buttons
    document.getElementById("btn-download-survey-csv").onclick = downloadSurveyCSV;
    document.getElementById("btn-download-credits-csv").onclick = downloadCreditsCSV;

    // Clear data button
    document.getElementById("btn-clear-local-data").onclick = () => {
        if (confirm("DİKKAT! Cihazda birikmiş tüm yerel yedek verileri silmek istediğinizden emin misiniz? (İndirmediyseniz veriler tamamen kaybolur)")) {
            if (confirm("Son Kez Onaylayın: Yerel veritabanı tamamen sıfırlanacaktır.")) {
                localStorage.removeItem("survey_responses");
                localStorage.removeItem("student_credits");
                alert("Yerel veriler sıfırlandı.");
                initAdminPanel();
            }
        }
    };
}

function generateAppQRCode() {
    const qrContainer = document.getElementById("qr-code-container");
    if (!qrContainer) return;
    qrContainer.innerHTML = ""; // Clear old QR

    // Mevcut URL'i al (temiz anket linki)
    const currentUrl = window.location.origin + window.location.pathname;
    document.getElementById("admin-app-url").value = currentUrl;

    // Kopyalama butonu
    document.getElementById("btn-copy-url").onclick = () => {
        navigator.clipboard.writeText(currentUrl);
        alert("Link kopyalandı!");
    };

    // QR Kod oluşturucu kitaplığı çağır
    try {
        new QRCode(qrContainer, {
            text: currentUrl,
            width: 160,
            height: 160,
            colorDark: "#0c0c0e",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (e) {
        console.error("QR kod kitaplığı yüklenemedi:", e);
        qrContainer.innerHTML = "<p class='text-danger'>QR Kod yüklenemedi.</p>";
    }
}

// --- CSV GENERATOR AND EXPORTERS (EXCEL / SPSS READY) ---
function downloadSurveyCSV() {
    const data = JSON.parse(localStorage.getItem("survey_responses") || "[]");
    if (data.length === 0) {
        alert("İndirilecek anket verisi bulunmamaktadır.");
        return;
    }

    // Düzleştirilmiş başlık listesini belirle
    const flatSamples = data.map(flattenDataForSheets);
    
    // Benzersiz tüm anahtarları (sütunları) çıkar
    const keys = [];
    flatSamples.forEach(sample => {
        Object.keys(sample).forEach(key => {
            if (!keys.includes(key)) keys.push(key);
        });
    });

    // CSV satırlarını oluştur
    let csvContent = "\uFEFF"; // Excel Türkçe karakter sorunu önleyici UTF-8 BOM
    csvContent += keys.join(",") + "\n"; // Başlık satırı

    flatSamples.forEach(sample => {
        const rowValues = keys.map(key => {
            let val = sample[key];
            if (val === undefined || val === null) return "";
            
            // Eğer veri içerisinde virgül veya tırnak varsa escape et
            let valStr = String(val);
            if (valStr.includes(",") || valStr.includes("\n") || valStr.includes('"')) {
                valStr = '"' + valStr.replace(/"/g, '""') + '"';
            }
            return valStr;
        });
        csvContent += rowValues.join(",") + "\n";
    });

    triggerFileDownload(csvContent, "arastirma_verileri.csv");
}

function downloadCreditsCSV() {
    const data = JSON.parse(localStorage.getItem("student_credits") || "[]");
    if (data.length === 0) {
        alert("İndirilecek öğrenci kaydı bulunmamaktadır.");
        return;
    }

    const headers = ["Zaman Damgası", "Ad Soyad", "Öğrenci Numarası", "Ders Adı"];
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += headers.join(",") + "\n";

    data.forEach(item => {
        const row = [
            item.timestamp || "",
            item.student_name || "",
            item.student_id || "",
            item.course_name || ""
        ].map(val => {
            let valStr = String(val);
            if (valStr.includes(",") || valStr.includes("\n") || valStr.includes('"')) {
                valStr = '"' + valStr.replace(/"/g, '""') + '"';
            }
            return valStr;
        });
        csvContent += row.join(",") + "\n";
    });

    triggerFileDownload(csvContent, "ek_puan_listesi.csv");
}

function triggerFileDownload(content, filename) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// --- SESSION STORAGE VE SAYFA KURTARMA (iOS / iPhone Koruma) ---
function saveSurveySession() {
    try {
        if (currentStep === "welcome" || currentStep === "thanks") {
            sessionStorage.removeItem("active_survey_step");
            sessionStorage.removeItem("active_survey_data");
            localStorage.removeItem("active_survey_backup");
            return;
        }
        sessionStorage.setItem("active_survey_step", currentStep);
        sessionStorage.setItem("active_survey_data", JSON.stringify(sessionData));
        
        // iOS agresif sekme temizliğine karşı 3 saatlik localStorage yedeği
        const backup = {
            step: currentStep,
            data: sessionData,
            time: Date.now()
        };
        localStorage.setItem("active_survey_backup", JSON.stringify(backup));
    } catch (e) {
        console.warn("Storage save error:", e);
    }
}

function restoreSurveySession() {
    try {
        let savedStep = sessionStorage.getItem("active_survey_step");
        let savedData = sessionStorage.getItem("active_survey_data");
        
        if (!savedStep || !savedData) {
            const backupStr = localStorage.getItem("active_survey_backup");
            if (backupStr) {
                const backup = JSON.parse(backupStr);
                if (Date.now() - backup.time < 3 * 60 * 60 * 1000) {
                    savedStep = backup.step;
                    savedData = JSON.stringify(backup.data);
                }
            }
        }

        if (savedStep && savedData && savedStep !== "welcome" && savedStep !== "thanks") {
            const parsed = JSON.parse(savedData);
            Object.assign(sessionData, parsed);

            // D1 Chat linki ve butonları
            if (sessionData.d1_assigned_model) {
                const chatLink1 = document.getElementById("btn-d1-chat-link");
                if (chatLink1) {
                    chatLink1.href = `https://mocolabtester.github.io/${sessionData.d1_assigned_model}/`;
                    chatLink1.classList.remove("disabled-link");
                }
                const btnD1AiDone = document.getElementById("btn-d1-ai-done");
                if (btnD1AiDone && sessionData.d1_chat_opened === 1) {
                    btnD1AiDone.disabled = false;
                }
                const readyCheck1 = document.getElementById("d1-ai-ready-check");
                if (readyCheck1) readyCheck1.checked = true;
            }

            // D2 Chat linki ve butonları
            if (sessionData.d2_assigned_model) {
                const chatLink2 = document.getElementById("btn-d2-chat-link");
                if (chatLink2) {
                    chatLink2.href = `https://mocolabtester.github.io/${sessionData.d2_assigned_model}/`;
                    chatLink2.classList.remove("disabled-link");
                }
                const btnD2AiDone = document.getElementById("btn-d2-ai-done");
                if (btnD2AiDone && sessionData.d2_chat_opened === 1) {
                    btnD2AiDone.disabled = false;
                }
                const readyCheck2 = document.getElementById("d2-ai-ready-check");
                if (readyCheck2) readyCheck2.checked = true;
            }

            // Form alanlarını geri yükle
            restoreInputValues();

            // Adımı göster
            showStep(savedStep);
            return true;
        }
    } catch (e) {
        console.warn("Storage restore error:", e);
    }
    return false;
}

function restoreInputValues() {
    try {
        if (sessionData.d1_initial_choice) {
            const r = document.querySelector(`input[name='d1-init-choice'][value='${sessionData.d1_initial_choice}']`);
            if (r) r.checked = true;
        }
        if (sessionData.d1_initial_rating) {
            const r = document.querySelector(`input[name='d1-init-rating'][value='${sessionData.d1_initial_rating}']`);
            if (r) r.checked = true;
        }
        if (sessionData.d1_final_choice) {
            const r = document.querySelector(`input[name='d1-post-choice'][value='${sessionData.d1_final_choice}']`);
            if (r) r.checked = true;
        }
        if (sessionData.d1_final_rating) {
            const r = document.querySelector(`input[name='d1-post-rating'][value='${sessionData.d1_final_rating}']`);
            if (r) r.checked = true;
        }
        if (sessionData.d1_summary) {
            const ta = document.getElementById("d1-summary-text");
            if (ta) ta.value = sessionData.d1_summary;
        }
        if (sessionData.d2_initial_choice) {
            const r = document.querySelector(`input[name='d2-init-choice'][value='${sessionData.d2_initial_choice}']`);
            if (r) r.checked = true;
        }
        if (sessionData.d2_initial_rating) {
            const r = document.querySelector(`input[name='d2-init-rating'][value='${sessionData.d2_initial_rating}']`);
            if (r) r.checked = true;
        }
        if (sessionData.d2_final_choice) {
            const r = document.querySelector(`input[name='d2-post-choice'][value='${sessionData.d2_final_choice}']`);
            if (r) r.checked = true;
        }
        if (sessionData.d2_final_rating) {
            const r = document.querySelector(`input[name='d2-post-rating'][value='${sessionData.d2_final_rating}']`);
            if (r) r.checked = true;
        }
        if (sessionData.d2_summary) {
            const ta = document.getElementById("d2-summary-text");
            if (ta) ta.value = sessionData.d2_summary;
        }
    } catch (e) {
        console.warn("Input restore error:", e);
    }
}
