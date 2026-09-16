export const storyTitle = 'Ang Munting Halaman';

export const storyParagraphs = [
  'Isang umaga, nakita ni Mia ang isang maliit na halaman sa kanilang bakuran. Mukhang tuyot ang mga dahon nito, kaya kumuha siya ng tubig at dahan-dahang diniligan ito.',
  'Kinabukasan, napansin ni Mia na mas luntian na ang mga dahon ng halaman. Araw-araw niya itong inalagaan. Makalipas ang ilang linggo, namukadkad ang halaman at nagkaroon ito ng maliliit na bulaklak.',
];

/**
 * Parse story paragraphs into a flat array of word objects.
 * Each word object carries metadata about its position, punctuation, and sentence.
 */
function parseWords(paragraphs) {
  const words = [];
  let globalId = 0;
  let sentenceIndex = 0;

  paragraphs.forEach((paragraph, pIdx) => {
    // Split on whitespace to get raw tokens
    const tokens = paragraph.split(/\s+/).filter(Boolean);

    tokens.forEach((token) => {
      // Separate trailing punctuation from the word
      const match = token.match(/^(.+?)([.,!?;:"""'']+)?$/);
      const cleanText = match ? match[1] : token;
      const punctuationAfter = match && match[2] ? match[2] : null;

      words.push({
        id: globalId++,
        text: token, // original token with punctuation
        cleanText, // word only, no punctuation
        punctuationAfter,
        paragraphIndex: pIdx,
        sentenceIndex,
      });

      // Advance sentence index on sentence-ending punctuation
      if (punctuationAfter && /[.!?]/.test(punctuationAfter)) {
        sentenceIndex++;
      }
    });
  });

  return words;
}

export const words = parseWords(storyParagraphs);

export const totalSentences = words.length > 0
  ? words[words.length - 1].sentenceIndex + 1
  : 0;

export const questions = [
  {
    id: 1,
    question: 'Sino ang nakakita ng maliit na halaman?',
    choices: ['Ana', 'Mia', 'Leo', 'Carlo'],
    correctIndex: 1,
    explanation: 'Si Mia ang nakakita ng maliit na halaman sa kanilang bakuran.',
  },
  {
    id: 2,
    question: 'Saan nakita ni Mia ang halaman?',
    choices: ['Sa palengke', 'Sa kanilang bakuran', 'Sa paaralan', 'Sa parke'],
    correctIndex: 1,
    explanation: 'Nakita ni Mia ang halaman sa kanilang bakuran.',
  },
  {
    id: 3,
    question: 'Ano ang ginawa ni Mia sa halaman?',
    choices: ['Tinulungan siya ng kapatid', 'Iniwan niya ito', 'Diniligan niya ito ng tubig', 'Ibinigay niya sa kaklase'],
    correctIndex: 2,
    explanation: 'Kumuha si Mia ng tubig at dahan-dahang diniligan ang halaman.',
  },
  {
    id: 4,
    question: 'Ano ang nangyari pagkatapos ng ilang linggo?',
    choices: [
      'Namatay ang halaman',
      'Namukadkad ang halaman at nagkaroon ng bulaklak',
      'Lumaki ang halaman nang napakalaki',
      'Kinain ng insekto ang halaman',
    ],
    correctIndex: 1,
    explanation: 'Makalipas ang ilang linggo, namukadkad ang halaman at nagkaroon ito ng maliliit na bulaklak.',
  },
  {
    id: 5,
    question: 'Ano ang aral na makukuha sa kuwento?',
    choices: [
      'Ang paglalaro ay masaya',
      'Ang pag-aalaga ng halaman ay mahalaga',
      'Ang pagtulog ay kailangan',
      'Ang pagkain ng gulay ay malusog',
    ],
    correctIndex: 1,
    explanation: 'Itinuturo ng kuwento na kapag inalagaan mo ang isang bagay, ito ay lalago at mamumulaklak.',
  },
];
