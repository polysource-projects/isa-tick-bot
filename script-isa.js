// ==UserScript==
// @name         Isa tick
// @namespace    http://tampermonkey.net/
// @version      2025-07-14 // v1.0
// @description  Message when there is a tick or a grade
// @author       ShadowLauw
// @match        https://isa.epfl.ch/imoniteur_ISAP/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=epfl.ch
// @grant        GM_xmlhttpRequest
// ==/UserScript==

function getTickedCourses() {
  return JSON.parse(localStorage.getItem("ticked") || "{}");
}

function getNotifiedGrades() {
  return JSON.parse(localStorage.getItem("grades") || "{}");
}

function markCourseAsTicked(courseName) {
  const courses = getTickedCourses();
  courses[courseName] = true;
  localStorage.setItem("ticked", JSON.stringify(courses));
}

function markGradeAsNotified(courseName) {
  const notified = getNotifiedGrades();
  notified[courseName] = true;
  localStorage.setItem("grades", JSON.stringify(notified));
}

function sendTelegramMessage(message) {
  GM_xmlhttpRequest({
    method: "POST",
    url: "http://localhost:3000/send",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      chat_id: "-4788513192", //set your telegram group
      text: message,
    }),
    onload: function (response) {
      console.log("Message Telegram envoyé :", response.responseText);
    },
    onerror: function (err) {
      console.error("Erreur d’envoi :", err);
    },
  });
}

function checkTickedCourses() {
  const ticked = getTickedCourses();
  const tickCells = document.querySelectorAll(".plan_3_1210158342");

  tickCells.forEach((cell) => {
    const hasTick = cell.getElementsByTagName("img").length > 0;

    if (hasTick) {
      const nameCell = cell.parentElement?.children[1];
      const nameDiv = nameCell?.querySelector("div");
      const courseName = nameDiv?.childNodes[1]?.textContent.trim();

      // Only log if we haven't seen this course before
      if (hasTick && courseName && !ticked[courseName]) {
        markCourseAsTicked(courseName);
        sendTelegramMessage(`✅ ${courseName} est coché !`);
      }
    }
  });
}

function checkGradesForTickedCourses() {
  const ticked = getTickedCourses();
  const notified = getNotifiedGrades();

  const rows = document
    .getElementById("listTab_1210142596")
    ?.querySelectorAll("tbody tr");

  rows.forEach((row) => {
    const courseNameCell = row.querySelector('td[headers="1"] div.tdLink');
    const gradeCell = row.querySelector('td[headers="4"] div > div');

    const courseName = courseNameCell?.textContent.trim();
    const grade = gradeCell?.textContent.trim();

    if (courseName && ticked[courseName] && grade?.match(/^\d+(\.\d+)?$/)) {
      if (!notified[courseName]) {
        sendTelegramMessage(`💯 La note de ${courseName} est sortie !`);
        markGradeAsNotified(courseName);
      }
    }
  });
}

function openGradesTab() {
  // 1er bouton pour changer d'onglet
  const tabButton = document.getElementById("30");
  if (tabButton) {
    tabButton.click();

    setTimeout(() => {
      // 2e bouton pour charger les notes
      const tr = document.querySelector(
        'tr[name="ww_i_inscription=4250754537&ww_i_gps=3375181439"]' //Changer pour le semestre en cours
      );

      if (tr) {
        const div = tr.querySelector("div.tdLink");
        if (div) {
          div.click();
          // Attendre que les notes soient chargées
          setTimeout(() => {
            checkGradesForTickedCourses();
          }, 4000);
        }
      }
    }, 4000);
  }
}

function returnToExamTab() {
  const tabButton = document.getElementById("35");
  if (tabButton) {
    tabButton.click();
  }
}

function waitAndClickPopupLink() {
  const targetSelector = "#logout-lockpage a[href='!PORTAL14S.htm']";

  const observer = new MutationObserver(() => {
    const link = document.querySelector(targetSelector);
    if (link && link.offsetParent !== null) {
      console.log("Timeout popup caught");
      link.click();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

setTimeout(() => {
  console.log("Initial check after DOM loaded.");
  checkTickedCourses();
  waitAndClickPopupLink();
  openGradesTab();

  // Repeat every 20 seconds
  setInterval(() => {
    const refreshButton = document.querySelector(
      '.prtl-maintoolbox a[onclick*="prtl.refresh"]'
    );
    if (refreshButton) {
      refreshButton.click();
      setTimeout(() => {
        checkTickedCourses();
        openGradesTab();
        returnToExamTab();
      }, 4000);
    } else {
      console.warn("Refresh button not found");
    }
  }, 20000);
}, 4000); // Wait for DOM to fully load
