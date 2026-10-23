const SUBJECT_LABELS_EN = {
  science: "Science",
  mathematics: "Mathematics",
  english: "English",
  "computer-basics": "Computer Basics",
};

const SUBJECT_LABELS_TA = {
  science: "அறிவியல்",
  mathematics: "கணிதம்",
  english: "ஆங்கிலம்",
  "computer-basics": "கணினி அடிப்படைகள்",
};

function subjectLabel(subject, language) {
  if (language === "ta") return SUBJECT_LABELS_TA[subject] ?? subject;
  return SUBJECT_LABELS_EN[subject] ?? subject;
}

export function formatAnswer(result, language) {
  if (result.type === "answer") {
    const { lesson, passage } = result;
    return {
      kind: "answer",
      intro:
        language === "ta"
          ? `${subjectLabel(lesson.subject, language)} பாடத்தில் இருந்து:`
          : `From the ${subjectLabel(lesson.subject, language)} lesson:`,
      passage,
      lessonTitle: lesson.title,
      lessonId: lesson.lessonId,
      language,
      sourceNote:
        language === "ta"
          ? "இந்தப் பதில் உள்ளூர் பாடக் களஞ்சியத்தில் உள்ள உரையிலிருந்து பெறப்பட்டது. இது ஒரு மொழிபெயர்ப்பு அல்லது புதிய உரை அல்ல."
          : "This answer was retrieved from a lesson stored locally on this device. It is not generated text.",
    };
  }

  if (result.type === "empty-query") {
    return {
      kind: "info",
      message:
        language === "ta"
          ? "உங்கள் கேள்வியைத் தட்டச்சு செய்யுங்கள்."
          : "Please type a question.",
    };
  }

  if (result.type === "not-found") {
    const reasonText = {
      "no-match":
        language === "ta"
          ? "உங்கள் கேள்விக்கு பொருந்தும் பாடம் உள்ளூர் களஞ்சியத்தில் இல்லை."
          : "The local library does not contain a lesson that matches this question.",
      "low-score":
        language === "ta"
          ? "உள்ளூர் களஞ்சியத்தில் தொடர்புடைய தகவல் இருப்பதாகத் தோன்றவில்லை. தயவுசெய்து கேள்வியை மாற்றி முயற்சிக்கவும்."
          : "The local library does not contain a reliable answer to this question. Try rephrasing it, or read a related lesson first.",
      "low-coverage":
        language === "ta"
          ? "உள்ளூர் களஞ்சியத்தில் இந்தக் கேள்விக்கான தகவல் முழுமையாக இல்லை. தயவுசெய்து வேறு வார்த்தைகளில் கேட்கவும் அல்லது தொடர்புடைய பாடத்தைப் படிக்கவும்."
          : "The local library only partially matches this question. Try rephrasing it, or read a related lesson first.",
      ambiguous:
        language === "ta"
          ? "இந்தக் கேள்விக்கு பல பாடங்கள் தொடர்புடையவை. தயவுசெய்து மேலும் குறிப்பிட்டதாகக் கேளுங்கள்."
          : "Several lessons match this question. Please make your question more specific.",
    };
    return {
      kind: "not-found",
      message: reasonText[result.reason] ?? reasonText["low-score"],
      nearestLessonTitle: result.nearest?.title,
      nearestLessonId: result.nearest?.lessonId,
    };
  }

  return {
    kind: "info",
    message:
      language === "ta"
        ? "மன்னிக்கவும், கேள்வியைப் புரிந்துகொள்ள முடியவில்லை."
        : "Sorry, that question could not be understood.",
  };
}

export function suggestedQueries(language) {
  if (language === "ta") {
    return [
      "ஒளிச்சேர்க்கை என்றால் என்ன?",
      "பின்னம் என்றால் என்ன?",
      "நீர் சுழற்சி எவ்வாறு நடைபெறுகிறது?",
      "கணினி என்றால் என்ன?",
    ];
  }
  return [
    "What is photosynthesis?",
    "What is a fraction?",
    "How does the water cycle work?",
    "What is a computer?",
  ];
}
