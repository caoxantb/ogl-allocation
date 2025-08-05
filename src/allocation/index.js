import seedrandom from "seedrandom";

const cleanData = (ogls) => {
  const labels = {
    NAM: "M",
    NỮ: "F",
    "TRỤ CỘT": "TC",
    "SÔI NỔI": "SN",
    FAMSHOW: "FS",
    FAMCHEER: "FC",
    "QUAN TÂM": "QT",
  };

  const cleanedOgls = ogls.map((ogl) => {
    const { id, class: className, gender, personality } = ogl;

    const cleanedClassName = className
      .split("-")
      .map((c) => c.trim())
      .join(" - ");

    const classType = cleanedClassName.endsWith("56") ? "K56" : "K55";

    if (
      !Object.keys(labels).includes(gender) ||
      !Object.keys(labels).includes(personality)
    ) {
      console.error(
        `Wrong labelling of either gender or personality for OGL at ID ${id}`
      );
    }

    return {
      ...ogl,
      class: cleanedClassName,
      classType,
      gender: labels[gender],
      personality: labels[personality],
    };
  });

  return cleanedOgls.sort((a, b) => parseInt(a.id) - parseInt(b.id));
};

const computeStats = (ogls) => {
  const total = ogls.length;
  const countG = { M: 0, F: 0 };
  const countP = { TC: 0, SN: 0, QT: 0, FS: 0, FC: 0 };
  const countCT = { K55: 0, K56: 0 };

  ogls.forEach((o) => {
    countG[o.gender]++;
    countP[o.personality]++;
    countCT[o.classType]++;
  });

  return {
    genderRatio: countG.F / total,
    personalityRatios: Object.fromEntries(
      Object.entries(countP).map(([p, c]) => [p, c / total])
    ),
    classTypeRatios: {
      K55: countCT.K55 / total,
      K56: countCT.K56 / total,
    },
  };
};

const scoreFamFit = (famStat, famSize, ogl, globalStats) => {
  // Base score
  let score = 0 - famSize;

  const newSize = famSize + 1;

  // Gender term
  const newF = famStat.F + (ogl.gender === "F" ? 1 : 0);
  const gProp = newF / newSize;
  score -= Math.abs(gProp - globalStats.genderRatio) * 80;

  // Personality term
  ["TC", "SN", "FS", "FC", "QT"].forEach((p) => {
    const newP = famStat[p] + (ogl.personality === p ? 1 : 0);
    const pProp = newP / newSize;
    score -= Math.abs(pProp - globalStats.personalityRatios[p]) * 40;
  });

  return score;
};

const groupByClass = (ogls) => {
  const stats = ogls.reduce((acc, cur) => {
    const key = cur.class;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return stats;
};

const assignOGLtoFam = (ogl, famIdx, fams, famStat, classCountByFam) => {
  fams[famIdx].push(ogl);
  famStat[famIdx][ogl.gender]++;
  famStat[famIdx][ogl.personality]++;
  famStat[famIdx][ogl.classType]++;
  classCountByFam[famIdx][ogl.class]++;
};

const calculateBestFams = (ogls, globalStats, numberOfFams, ogsPerFam) => {
  const rng = seedrandom("42");
  const fams = Array.from({ length: numberOfFams }, () => []);
  const famStat = Array(numberOfFams)
    .fill()
    .map(() => ({
      M: 0,
      F: 0,
      TC: 0,
      SN: 0,
      FS: 0,
      FC: 0,
      QT: 0,
      K55: 0,
      K56: 0,
    }));
  const classCountAll = groupByClass(ogls);
  const classCountByFam = Array.from({ length: numberOfFams }, () =>
    Object.fromEntries(Object.keys(classCountAll).map((k) => [k, 0]))
  );
  const k12 = ogls.filter((ogl) => ogl.classType === "K55").length;

  const assignedOgls = new Set();

  ogls.forEach((ogl) => {
    if (ogl.fam) {
      assignOGLtoFam(ogl, ogl.fam - 1, fams, famStat, classCountByFam);
      assignedOgls.add(ogl.id);
    }
  });

  // edge case assignment
  ogls.forEach((ogl) => {
    if (assignedOgls.has(ogl.id)) return;

    // hard constraint for ogl with relationship
    if (ogl.relationship) {
      const partnerOgl = ogls.find((pOgl) => pOgl.id === ogl.relationship);

      let a, b;

      if (!partnerOgl.fam) {
        do {
          a = Math.floor(rng() * numberOfFams);
          b = Math.floor(rng() * numberOfFams);
        } while (
          a === b ||
          classCountByFam[a][ogl.class] >= ogsPerFam ||
          classCountByFam[b][partnerOgl.class] >= ogsPerFam
        );

        assignOGLtoFam(partnerOgl, b, fams, famStat, classCountByFam);
        assignedOgls.add(partnerOgl.id);
      } else {
        do {
          a = Math.floor(rng() * numberOfFams);
        } while (
          a === partnerOgl.fam - 1 ||
          classCountByFam[a][ogl.class] >= ogsPerFam
        );
      }

      assignOGLtoFam(ogl, a, fams, famStat, classCountByFam);
      assignedOgls.add(ogl.id);
      return;
    }

    // hard constraint for class with more than 2*ogsperfam
    if (classCountAll[ogl.class] >= 2 * ogsPerFam) {
      let a;
      do {
        a = Math.floor(rng() * numberOfFams);
      } while (classCountByFam[a][ogl.class] >= ogsPerFam);

      assignOGLtoFam(ogl, a, fams, famStat, classCountByFam);
      assignedOgls.add(ogl.id);

      return;
    }

    // hard constraint for grade 12
    if (ogl.classType === "K55") {
      let maxIter = 0,
        a;
      do {
        a = Math.floor(rng() * numberOfFams);
        maxIter++;
      } while (
        famStat[a]["K55"] > Math.ceil(k12 / numberOfFams) &&
        maxIter < 10
      );

      assignOGLtoFam(ogl, a, fams, famStat, classCountByFam);
      assignedOgls.add(ogl.id);
      return;
    }
  });

  // other assignment
  ogls.forEach((ogl) => {
    if (assignedOgls.has(ogl.id)) return;

    let bestFam = -1,
      bestScore = -Infinity;
    for (let i = 0; i < numberOfFams; i++) {
      if (
        fams[i].length >= Math.ceil(ogls.length / numberOfFams) ||
        classCountByFam[i][ogl.class] >= ogsPerFam
      )
        continue;
      const sc = scoreFamFit(famStat[i], fams[i].length, ogl, globalStats);
      if (sc > bestScore) {
        bestScore = sc;
        bestFam = i;
      }
    }

    // Smallest fam if no fam fit
    if (bestFam < 0) {
      bestFam = fams.reduce(
        (mi, f, idx) => (f.length < fams[mi].length ? idx : mi),
        0
      );
    }

    // Commit to bestFam
    assignOGLtoFam(ogl, bestFam, fams, famStat, classCountByFam);
  });

  return fams;
};

const assignOGs = (fam, globalStats, ogsPerFam) => {
  const ogs = Array.from({ length: ogsPerFam }, () => []);
  const classSets = Array.from({ length: ogsPerFam }, () => new Set());
  const ctCounts = Array.from({ length: ogsPerFam }, () => ({
    K55: 0,
    K56: 0,
  }));

  // Step 1: Count frequency by class
  const classCounts = groupByClass(fam);

  // Step 2: Sort users by frequency of their class (descending)
  fam.sort((a, b) => {
    return classCounts[b.class] - classCounts[a.class];
  });

  fam.forEach((ogl) => {
    if (ogl.og) {
      const ogIdx = (ogl.og - 1) % ogsPerFam;
      ogs[ogIdx].push(ogl);
      classSets[ogIdx].add(ogl.class);
      ctCounts[ogIdx][ogl.classType]++;
    }
  });

  fam.forEach((ogl) => {
    if (ogl.og) return;
    // Score each OG slot
    const scores = ogs.map((og, i) => {
      if (
        og.length >= Math.ceil(fam.length / ogsPerFam) ||
        classSets[i].has(ogl.class)
      )
        return -Infinity;

      let sc = 0 - og.length * 10;

      // gender
      const fCnt = og.filter((o) => o.gender === "F").length;
      const gProp = (fCnt + (ogl.gender === "F")) / (og.length + 1);
      sc -= Math.abs(gProp - globalStats.genderRatio) * 80;

      // personality
      ["TC", "SN", "FS", "FC", "QT"].forEach((p) => {
        const pCnt = og.filter((o) => o.personality === p).length;
        const pProp =
          (pCnt + (ogl.personality === p ? 1 : 0)) / (og.length + 1);
        sc -= Math.abs(pProp - globalStats.personalityRatios[p]) * 40;
      });

      // class-type
      const newK12 = ctCounts[i].K55 + (ogl.classType === "K55" ? 1 : 0);
      const ctProp = newK12 / (og.length + 1);
      sc -= Math.abs(ctProp - globalStats.classTypeRatios.K55) * 20;

      return sc;
    });

    const best = scores.indexOf(Math.max(...scores));

    ogs[best].push(ogl);
    classSets[best].add(ogl.class);
    ctCounts[best][ogl.classType]++;
  });

  return ogs;
};

export const parseOGL = (rawData, numberOfFams, ogsPerFam) => {
  const ogls = cleanData(rawData);
  const globalStats = computeStats(ogls);
  const fams = calculateBestFams(ogls, globalStats, numberOfFams, ogsPerFam);
  const result = [];

  fams.forEach((fam, fi) => {
    const ogs = assignOGs(fam, globalStats, ogsPerFam);

    ogs.forEach((og, oi) => {
      og.forEach((ogl) => {
        result.push({
          ...ogl,
          fam: fi + 1,
          og: fi * ogsPerFam + oi + 1,
        });
      });
    });
  });

  result.sort((a, b) => {
    const sufA = parseInt((a.class.match(/(\d{2})$/) || [])[1] || 0, 10);
    const sufB = parseInt((b.class.match(/(\d{2})$/) || [])[1] || 0, 10);
    if (sufA !== sufB) return sufB - sufA;

    const letterA = a.class.trim()[0].toUpperCase();
    const letterB = b.class.trim()[0].toUpperCase();
    if (letterA !== letterB) return letterA.localeCompare(letterB);

    const numA = parseInt((a.class.match(/^[A-Za-z]+(\d+)/) || [])[1] || 0, 10);
    const numB = parseInt((b.class.match(/^[A-Za-z]+(\d+)/) || [])[1] || 0, 10);
    return numA - numB;
  });

  return result;
};
