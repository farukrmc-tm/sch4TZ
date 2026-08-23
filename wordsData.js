const modulesData = [
  {
    id: "1.1",
    title: "1.1 Schule und Bildung",
    words: [
      {
        id: 101,
        de: "eingeschult werden*",
        type: "Fiil (Passiv)",
        prep: "",
        tr: "okula başlatılmak",
        register: "Wissenschaftssprache",
        ex_de: "Die meisten Kinder werden im Alter von sechs Jahren eingeschult.",
        ex_tr: "Çocukların çoğu altı yaşında okula başlatılır.",
        tip: "die Einschulung (okula başlama) ile aynı kök."
      },
      {
        id: 102,
        de: "zur Schule gehen*",
        type: "Fiil",
        prep: "zu + Dativ",
        tr: "okula gitmek",
        register: "Alltagssprache",
        ex_de: "Wenn man Abitur machen will, muss man 12 oder 13 Jahre zur Schule gehen.",
        ex_tr: "Abitur yapmak isteyen kişi 12-13 yıl okula gitmek zorundadır."
      },
      {
        id: 103,
        de: "eine Schule besuchen",
        type: "Fiil",
        prep: "Akkusativ",
        tr: "bir okula gitmek/devam etmek",
        register: "Wissenschaftssprache",
        ex_de: "Die Eltern legen großen Wert darauf, dass ihr Kind eine gute Schule besucht.",
        ex_tr: "Ebeveynler çocuklarının iyi bir okula gitmesine büyük önem verir."
      },
      {
        id: 104,
        de: "die Schulpflicht / schulpflichtig",
        type: "İsim (dişi) / Sıfat",
        prep: "",
        tr: "zorunlu eğitim / zorunlu eğitim çağında olan",
        register: "Wissenschaftssprache",
        ex_de: "Die Dauer der allgemeinen Schulpflicht beträgt in Deutschland mindestens neun Schuljahre.",
        ex_tr: "Genel zorunlu eğitimin süresi Almanya'da en az dokuz yıldır."
      },
      {
        id: 105,
        de: "die Schule schwänzen",
        type: "Fiil",
        prep: "Akkusativ",
        tr: "okulu asmak",
        register: "Alltagssprache",
        ex_de: "Sie schwänzt die Schule und trifft sich mit ihren Freunden im Park.",
        ex_tr: "Okulu asıp arkadaşlarıyla parkta buluşuyor."
      },
      {
        id: 106,
        de: "die Schule abbrechen*",
        type: "Fiil (ayrılabilir)",
        prep: "Akkusativ",
        tr: "okulu yarım bırakmak",
        register: "Wissenschaftssprache",
        ex_de: "Wer die Schule abgebrochen hat, findet nur schwer einen Arbeitsplatz.",
        ex_tr: "Okulu bırakan kişi zorlukla iş bulur.",
        tip: "brechen (kırmak) -> yarıda kesmek; abschließen ile karıştırma."
      },
      {
        id: 107,
        de: "die Leistung, Leistungen",
        type: "İsim (dişi)",
        prep: "",
        tr: "performans, başarı",
        register: "Wissenschaftssprache",
        ex_de: "Früher war sie eine gute Schülerin, aber im letzten Schuljahr haben ihre Leistungen nachgelassen.",
        ex_tr: "Eskiden iyi bir öğrenciydi, ama geçen yıl performansı düştü."
      },
      {
        id: 108,
        de: "eine Prüfung bestehen*",
        type: "Fiil kalıbı",
        prep: "",
        tr: "bir sınavı geçmek",
        register: "Wissenschaftssprache",
        ex_de: "Er hat die Prüfung bestanden, obwohl die Aufgaben sehr schwierig waren.",
        ex_tr: "Görevler çok zor olmasına rağmen sınavı geçti.",
        tip: "bestehen = sınav karşısında ayakta kalmak, geçmek."
      }
    ]
  },
  {
    id: "1.2",
    title: "1.2 Studium",
    words: [
      {
        id: 201,
        de: "sich immatrikulieren (lassen)",
        type: "Dönüşlü fiil",
        prep: "an + Dativ",
        tr: "üniversiteye kayıt olmak",
        register: "Wissenschaftssprache",
        ex_de: "Bevor man mit dem Studium beginnen kann, muss man sich an der Hochschule immatrikulieren.",
        ex_tr: "Eğitime başlamadan önce üniversiteye kayıt olmak gerekir."
      },
      {
        id: 202,
        de: "die Regelstudienzeit überschreiten*",
        type: "Fiil kalıbı",
        prep: "",
        tr: "normal eğitim süresini aşmak",
        register: "Wissenschaftssprache",
        ex_de: "Studierende, die neben dem Studium jobben, überschreiten häufig die Regelstudienzeit.",
        ex_tr: "Eğitiminin yanı sıra çalışan öğrenciler normal eğitim süresini sık sık aşar."
      },
      {
        id: 203,
        de: "eine Vorlesung halten",
        type: "Fiil kalıbı",
        prep: "",
        tr: "bir ders vermek (konferans tarzı)",
        register: "Wissenschaftssprache",
        ex_de: "Professor Steinberg hält jedes Semester die Vorlesung.",
        ex_tr: "Profesör Steinberg her dönem bu dersi veriyor."
      },
      {
        id: 204,
        de: "das Propädeutikum",
        type: "İsim (nötr)",
        prep: "",
        tr: "hazırlık kursu (akademik)",
        register: "Wissenschaftssprache",
        ex_de: "Im Rahmen eines Propädeutikums werden den Studierenden wissenschaftliche Arbeitstechniken vermittelt.",
        ex_tr: "Bir hazırlık kursu kapsamında öğrencilere bilimsel çalışma teknikleri aktarılır."
      }
    ]
  },
  {
    id: "2.1",
    title: "2.1 Ernährung",
    words: [
      {
        id: 301,
        de: "etw. verzehren",
        type: "Fiil",
        prep: "Akkusativ",
        tr: "tüketmek (gıda)",
        register: "Wissenschaftssprache",
        ex_de: "Ernährungsexperten empfehlen, regelmäßig Seefisch zu verzehren.",
        ex_tr: "Beslenme uzmanları düzenli deniz balığı tüketmeyi önerir."
      },
      {
        id: 302,
        de: "verzichten auf + A",
        type: "Fiil",
        prep: "auf + Akkusativ",
        tr: "-den vazgeçmek",
        register: "Wissenschaftssprache",
        ex_de: "Es ist nicht immer leicht, auf Nahrungsmittel zu verzichten, die ungesund sind.",
        ex_tr: "Sağlıksız gıdalardan vazgeçmek her zaman kolay değildir."
      },
      {
        id: 303,
        de: "ertragreich",
        type: "Sıfat",
        prep: "",
        tr: "yüksek verimli",
        register: "Wissenschaftssprache",
        ex_de: "Ertragreiche Getreidesorten liefern den Landwirten eine besonders gute Ernte.",
        ex_tr: "Yüksek verimli tahıl türleri çiftçilere özellikle iyi bir hasat sağlar."
      }
    ]
  },
  {
    id: "4.1",
    title: "4.1 Bevölkerung und Gesellschaft",
    words: [
      {
        id: 401,
        de: "die Bevölkerung schrumpft",
        type: "Fiil kalıbı",
        prep: "",
        tr: "nüfus azalıyor / küçülüyor",
        register: "Wissenschaftssprache",
        ex_de: "Es wird erwartet, dass die Bevölkerung in Deutschland deutlich schrumpfen wird.",
        ex_tr: "Almanya'da nüfusun belirgin şekilde azalması bekleniyor."
      },
      {
        id: 402,
        de: "angehören + D",
        type: "Fiil",
        prep: "+ Dativ",
        tr: "bir şeye / bir gruba ait olmak",
        register: "Wissenschaftssprache",
        ex_de: "Manchen Menschen ist es wichtig zu zeigen, welcher sozialen Schicht sie angehören.",
        ex_tr: "Bazı insanlar için hangi sosyal tabakaya ait olduklarını göstermek önemlidir."
      },
      {
        id: 403,
        de: "Vorurteile abbauen",
        type: "Fiil kalıbı",
        prep: "",
        tr: "önyargıları azaltmak",
        register: "Wissenschaftssprache",
        ex_de: "Persönlicher Kontakt kann dazu beitragen, Vorurteile abzubauen.",
        ex_tr: "Kişisel temas önyargıları azaltmaya katkıda bulunabilir."
      }
    ]
  }
];
