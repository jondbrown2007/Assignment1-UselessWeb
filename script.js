const form = document.querySelector("#password-form");
const passwordInput = document.querySelector("#password-input");
const visibilityToggle = document.querySelector("#visibility-toggle");
const checkButton = document.querySelector("#check-button");
const formMessage = document.querySelector("#form-message");
const checkView = document.querySelector("#check-view");
const resultView = document.querySelector("#result-view");
const resultTitle = document.querySelector("#result-title");
const resultMessage = document.querySelector("#result-message");
const backButton = document.querySelector("#back-button");

const breachRoasts = [
  "That password has the security instincts of a screen door on a submarine.",
  "A password manager just felt a disturbance in the force.",
  "Hackers saw this one and barely had to warm up.",
  "This password is about as secret as a megaphone in a library.",
  "Even a sleepy keyboard could have guessed that one.",
  "That password left the front door open and put up a welcome sign.",
  "Somewhere, a hacker just got the easiest win of their day.",
  "This password's disguise is a pair of glasses and a fake mustache.",
  "It has been spotted in the wild more often than a pigeon.",
  "That password couldn't keep a secret at a surprise party.",
  "A sticky note would have done a better job protecting this one.",
  "This password has the stealth of a marching band.",
  "The internet has seen this password more times than you have.",
  "That password is making the other passwords nervous.",
  "A lock made of cardboard would be an upgrade.",
  "This password's security strategy seems to be wishful thinking.",
  "It got caught so often it should have its own frequent-flyer card.",
  "That password is about as hard to guess as the word 'password.'",
  "The breach database recognized it before we finished asking.",
  "This password needs a makeover and a password manager."
];

function showResult(title, message) {
  resultTitle.textContent = title;
  resultMessage.textContent = message;
  checkView.hidden = true;
  resultView.hidden = false;
  backButton.focus();
}

async function countBreaches(password) {
  const encodedPassword = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-1", encodedPassword);
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("").toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: {
      "Add-Padding": "true"
    }
  });

  if (!response.ok) {
    throw new Error("The password check could not be completed.");
  }

  const matches = (await response.text()).split(/\r?\n/);
  const match = matches.find((line) => line.split(":")[0] === suffix);
  return match ? Number(match.split(":")[1]) : 0;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "";

  let password = passwordInput.value;
  if (!password) {
    formMessage.textContent = "Please enter a password to check.";
    passwordInput.focus();
    return;
  }

  passwordInput.value = "";
  checkButton.classList.remove("button--danger");
  backButton.classList.remove("button--danger");
  checkButton.disabled = true;
  checkButton.textContent = "Checking...";

  try {
    const breachCount = await countBreaches(password);
    password = "";

    if (breachCount > 0) {
      const roast = breachRoasts[Math.floor(Math.random() * breachRoasts.length)];
      checkButton.classList.add("button--danger");
      backButton.classList.add("button--danger");
      showResult(
        "Your password is cooked!",
        `It has appeared in breaches ${breachCount.toLocaleString()} times. ${roast}`
      );
    } else {
      checkButton.classList.remove("button--danger");
      backButton.classList.remove("button--danger");
      showResult(
        "Not found in known data breaches",
        "This password wasn't found in any data breaches."
      );
    }
  } catch {
    password = "";
    checkButton.classList.remove("button--danger");
    backButton.classList.remove("button--danger");
    showResult(
      "We couldn't check that password.",
      "Please check your internet connection and try again."
    );
  } finally {
    checkButton.disabled = false;
    checkButton.textContent = "Check";
  }
});

visibilityToggle.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  visibilityToggle.textContent = isHidden ? "Hide" : "Show";
  visibilityToggle.setAttribute("aria-label", `${isHidden ? "Hide" : "Show"} password`);
});

backButton.addEventListener("click", () => {
  resultView.hidden = true;
  checkView.hidden = false;
  checkButton.classList.remove("button--danger");
  backButton.classList.remove("button--danger");
  formMessage.textContent = "";
  passwordInput.value = "";
  passwordInput.type = "password";
  visibilityToggle.textContent = "Show";
  visibilityToggle.setAttribute("aria-label", "Show password");
  passwordInput.focus();
});
