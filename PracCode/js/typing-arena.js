
// ========================================
// PRACCODE - TYPING ARENA
// Expanded languages + Strict Typing Mode
// Connected to Node.js + MySQL
// ========================================

// 1. PROGRAMMING LANGUAGE PASSAGES

const typingPassages = {
    HTML: {
        Easy: [
            '<h1>Hello World</h1>\n<p>Welcome to my website.</p>',
            '<h2>About Me</h2>\n<p>I love learning HTML.</p>'
        ],
        Medium: [
            '<header>\n    <h1>My Website</h1>\n    <nav><a href="/">Home</a></nav>\n</header>',
            '<section class="about">\n    <h2>About Us</h2>\n    <p>Learn more about our company.</p>\n</section>'
        ],
        Hard: [
            '<form action="/register" method="POST">\n    <label for="email">Email:</label>\n    <input type="email" id="email" required>\n    <button type="submit">Register</button>\n</form>'
        ],
        Advanced: [
            '<main aria-labelledby="main-title">\n    <section id="dashboard" aria-live="polite">\n        <h1 id="main-title">User Dashboard</h1>\n        <button type="button" aria-label="Open settings">Settings</button>\n    </section>\n</main>'
        ]
    },

    CSS: {
        Easy: [
            'body {\n    margin: 0;\n    color: #333;\n}',
            'h1 {\n    color: blue;\n    font-size: 24px;\n}'
        ],
        Medium: [
            '.card {\n    padding: 20px;\n    border-radius: 12px;\n    background: #ffffff;\n    box-shadow: 0 4px 12px #0002;\n}'
        ],
        Hard: [
            '@media (max-width: 768px) {\n    .container {\n        display: flex;\n        flex-direction: column;\n        gap: 16px;\n    }\n}'
        ],
        Advanced: [
            ':root {\n    --primary: #7c3aed;\n    --surface: #111827;\n}\n\n.dashboard {\n    display: grid;\n    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n    gap: clamp(1rem, 3vw, 2rem);\n}'
        ]
    },

    JavaScript: {
        Easy: [
            'const name = "PracCode";\nconsole.log(name);',
            'let score = 100;\nconsole.log(score);'
        ],
        Medium: [
            'function greet(name) {\n    return `Hello, ${name}!`;\n}\n\nconsole.log(greet("Developer"));'
        ],
        Hard: [
            'const numbers = [1, 2, 3, 4, 5];\n\nconst doubled = numbers.map(number => number * 2);\nconsole.log(doubled);'
        ],
        Advanced: [
            'async function fetchUsers() {\n    try {\n        const response = await fetch("/api/users");\n        if (!response.ok) throw new Error("Request failed");\n        return await response.json();\n    } catch (error) {\n        console.error(error);\n    }\n}'
        ]
    },

    Python: {
        Easy: [
            'name = "PracCode"\nprint(name)',
            'age = 20\nprint("My age is", age)'
        ],
        Medium: [
            'def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Developer"))'
        ],
        Hard: [
            'numbers = [1, 2, 3, 4, 5]\n\nsquares = [number ** 2 for number in numbers if number % 2 == 0]\nprint(squares)'
        ],
        Advanced: [
            'class Student:\n    def __init__(self, name, grades):\n        self.name = name\n        self.grades = grades\n\n    def average(self):\n        return sum(self.grades) / len(self.grades)\n\nstudent = Student("Alex", [90, 85, 95])\nprint(student.average())'
        ]
    },

    Java: {
        Easy: [
            'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}'
        ],
        Medium: [
            'public class Calculator {\n    public int add(int a, int b) {\n        return a + b;\n    }\n}'
        ],
        Hard: [
            'import java.util.ArrayList;\n\npublic class Main {\n    public static void main(String[] args) {\n        ArrayList<String> names = new ArrayList<>();\n        names.add("Alex");\n        System.out.println(names);\n    }\n}'
        ],
        Advanced: [
            'public interface Repository<T> {\n    T findById(int id);\n    void save(T entity);\n}\n\npublic class UserService {\n    private final Repository<User> repository;\n\n    public UserService(Repository<User> repository) {\n        this.repository = repository;\n    }\n}'
        ]
    },

    C: {
        Easy: [
            '#include <stdio.h>\n\nint main() {\n    printf("Hello World");\n    return 0;\n}'
        ],
        Medium: [
            '#include <stdio.h>\n\nint main() {\n    int number = 10;\n    printf("Number: %d", number);\n    return 0;\n}'
        ],
        Hard: [
            '#include <stdio.h>\n\nint main() {\n    int numbers[] = {2, 4, 6, 8};\n    int size = sizeof(numbers) / sizeof(numbers[0]);\n\n    for (int i = 0; i < size; i++) {\n        printf("%d\\n", numbers[i]);\n    }\n    return 0;\n}'
        ],
        Advanced: [
            '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int *values = malloc(5 * sizeof(int));\n    if (values == NULL) return 1;\n\n    for (int i = 0; i < 5; i++) {\n        values[i] = i * i;\n    }\n\n    free(values);\n    return 0;\n}'
        ]
    },

    "C++": {
        Easy: [
            '#include <iostream>\n\nint main() {\n    std::cout << "Hello World";\n    return 0;\n}'
        ],
        Medium: [
            '#include <iostream>\n#include <string>\n\nint main() {\n    std::string name = "Alex";\n    std::cout << "Hello " << name;\n    return 0;\n}'
        ],
        Hard: [
            '#include <vector>\n#include <iostream>\n\nint main() {\n    std::vector<int> numbers = {1, 2, 3, 4};\n    for (int number : numbers) {\n        std::cout << number << std::endl;\n    }\n    return 0;\n}'
        ],
        Advanced: [
            'template <typename T>\nT calculateAverage(const std::vector<T>& values) {\n    if (values.empty()) throw std::invalid_argument("Empty list");\n\n    T total{};\n    for (const auto& value : values) total += value;\n    return total / static_cast<T>(values.size());\n}'
        ]
    },

    "C#": {
        Easy: [
            'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello World");\n    }\n}'
        ],
        Medium: [
            'using System;\n\nclass Calculator {\n    public int Add(int a, int b) {\n        return a + b;\n    }\n}'
        ],
        Hard: [
            'using System.Collections.Generic;\n\nvar names = new List<string> { "Alex", "Sam", "Jordan" };\n\nforeach (string name in names) {\n    Console.WriteLine(name);\n}'
        ],
        Advanced: [
            'public async Task<User?> FindUserAsync(int id) {\n    var user = await _repository.FindByIdAsync(id);\n\n    if (user is null) {\n        throw new KeyNotFoundException("User not found");\n    }\n\n    return user;\n}'
        ]
    },

    PHP: {
        Easy: [
            '<?php\n$name = "PracCode";\necho $name;\n?>'
        ],
        Medium: [
            '<?php\nfunction greet($name) {\n    return "Hello, " . $name;\n}\n\necho greet("Developer");\n?>'
        ],
        Hard: [
            '<?php\n$users = ["Alex", "Sam", "Jordan"];\n\nforeach ($users as $user) {\n    echo "Welcome, " . $user . PHP_EOL;\n}\n?>'
        ],
        Advanced: [
            '<?php\nclass User {\n    public function __construct(\n        private string $name,\n        private string $email\n    ) {}\n\n    public function getName(): string {\n        return $this->name;\n    }\n}\n?>'
        ]
    },

    SQL: {
        Easy: [
            'SELECT * FROM users;',
            'SELECT name, email FROM customers;'
        ],
        Medium: [
            'SELECT name, email\nFROM users\nWHERE is_active = 1\nORDER BY name ASC;'
        ],
        Hard: [
            'SELECT customers.name, COUNT(orders.id) AS total_orders\nFROM customers\nLEFT JOIN orders ON customers.id = orders.customer_id\nGROUP BY customers.id, customers.name\nHAVING COUNT(orders.id) > 0;'
        ],
        Advanced: [
            'WITH monthly_sales AS (\n    SELECT DATE_FORMAT(created_at, "%Y-%m") AS sales_month,\n           SUM(total_amount) AS revenue\n    FROM sales\n    GROUP BY DATE_FORMAT(created_at, "%Y-%m")\n)\nSELECT sales_month, revenue,\n       LAG(revenue) OVER (ORDER BY sales_month) AS previous_revenue\nFROM monthly_sales;'
        ]
    },

    TypeScript: {
        Easy: [
            'const message: string = "Hello World";\nconsole.log(message);'
        ],
        Medium: [
            'interface User {\n    id: number;\n    name: string;\n}\n\nconst user: User = { id: 1, name: "Alex" };'
        ],
        Hard: [
            'function getProperty<T, K extends keyof T>(\n    object: T,\n    key: K\n): T[K] {\n    return object[key];\n}'
        ],
        Advanced: [
            'type ApiResponse<T> = {\n    success: boolean;\n    data: T;\n    error?: string;\n};\n\nasync function request<T>(url: string): Promise<ApiResponse<T>> {\n    const response = await fetch(url);\n    return response.json() as Promise<ApiResponse<T>>;\n}'
        ]
    },

    Go: {
        Easy: [
            'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}'
        ],
        Medium: [
            'package main\n\nfunc add(a int, b int) int {\n    return a + b\n}'
        ],
        Hard: [
            'package main\n\nimport "fmt"\n\nfunc main() {\n    numbers := []int{1, 2, 3, 4}\n    for index, number := range numbers {\n        fmt.Println(index, number)\n    }\n}'
        ],
        Advanced: [
            'func process(ctx context.Context, jobs <-chan Job) error {\n    for {\n        select {\n        case <-ctx.Done():\n            return ctx.Err()\n        case job, ok := <-jobs:\n            if !ok {\n                return nil\n            }\n            if err := job.Execute(ctx); err != nil {\n                return err\n            }\n        }\n    }\n}'
        ]
    },

    Ruby: {
        Easy: [
            'name = "PracCode"\nputs name'
        ],
        Medium: [
            'def greet(name)\n  "Hello, #{name}!"\nend\n\nputs greet("Developer")'
        ],
        Hard: [
            'numbers = [1, 2, 3, 4, 5]\n\nsquares = numbers.select { |n| n.even? }.map { |n| n ** 2 }\nputs squares'
        ],
        Advanced: [
            'class User\n  attr_reader :name, :email\n\n  def initialize(name:, email:)\n    @name = name\n    @email = email\n  end\n\n  def active?\n    !@email.nil? && !@email.empty?\n  end\nend'
        ]
    },

    Swift: {
        Easy: [
            'let name = "PracCode"\nprint(name)'
        ],
        Medium: [
            'func greet(name: String) -> String {\n    return "Hello, \\(name)!"\n}\n\nprint(greet(name: "Developer"))'
        ],
        Hard: [
            'let numbers = [1, 2, 3, 4, 5]\nlet evenNumbers = numbers.filter { $0 % 2 == 0 }\nlet squares = evenNumbers.map { $0 * $0 }\nprint(squares)'
        ],
        Advanced: [
            'struct User: Codable {\n    let id: Int\n    let name: String\n}\n\nfunc loadUser() async throws -> User {\n    let url = URL(string: "https://example.com/user")!\n    let (data, _) = try await URLSession.shared.data(from: url)\n    return try JSONDecoder().decode(User.self, from: data)\n}'
        ]
    },

    Kotlin: {
        Easy: [
            'fun main() {\n    println("Hello World")\n}'
        ],
        Medium: [
            'fun greet(name: String): String {\n    return "Hello, $name!"\n}'
        ],
        Hard: [
            'data class User(val id: Int, val name: String)\n\nfun main() {\n    val users = listOf(User(1, "Alex"), User(2, "Sam"))\n    users.forEach { println(it.name) }\n}'
        ],
        Advanced: [
            'suspend fun fetchUser(id: Int): Result<User> {\n    return try {\n        val user = repository.findById(id)\n            ?: throw IllegalStateException("User not found")\n        Result.success(user)\n    } catch (error: Exception) {\n        Result.failure(error)\n    }\n}'
        ]
    },

    Rust: {
        Easy: [
            'fn main() {\n    println!("Hello World");\n}'
        ],
        Medium: [
            'fn add(a: i32, b: i32) -> i32 {\n    a + b\n}\n\nfn main() {\n    println!("{}", add(5, 3));\n}'
        ],
        Hard: [
            'fn main() {\n    let numbers = vec![1, 2, 3, 4, 5];\n    let squares: Vec<i32> = numbers\n        .iter()\n        .filter(|&&n| n % 2 == 0)\n        .map(|&n| n * n)\n        .collect();\n    println!("{:?}", squares);\n}'
        ],
        Advanced: [
            'use std::collections::HashMap;\n\nfn count_words(text: &str) -> HashMap<String, usize> {\n    let mut counts = HashMap::new();\n    for word in text.split_whitespace() {\n        *counts.entry(word.to_lowercase()).or_insert(0) += 1;\n    }\n    counts\n}'
        ]
    }
};


// 2. ELEMENTS

const typingDisplay = document.querySelector(".typing-text-display");
const typingInput = document.querySelector(".typing-input");

const timerDisplay = document.querySelector("#typing-timer");
const wpmDisplay = document.querySelector("#typing-wpm");
const accuracyDisplay = document.querySelector("#typing-accuracy");
const errorsDisplay = document.querySelector("#typing-errors");

const progressBar = document.querySelector("#typing-progress");
const progressText = document.querySelector("#typing-progress-text");

const startButton = document.querySelector("#typing-start");
const resetButton = document.querySelector("#typing-reset");
const resultsContainer = document.querySelector(".typing-results");

const languageSelect = document.querySelector("#typing-language");
const timerSelect = document.querySelector("#typing-duration");
const difficultyButtons = document.querySelectorAll("[data-typing-difficulty]");

const customCodeInput = document.querySelector("#custom-code-input");
const useCustomCodeButton = document.querySelector("#use-custom-code");
const codeFileInput = document.querySelector("#typing-file-input");


// 3. STATE

let selectedLanguage = "HTML";
let selectedDifficulty = "Easy";
let currentPassage = "";

let timeLimit = 60;
let timeLeft = 60;
let timerInterval = null;

let testStarted = false;
let testFinished = false;
let resultSaved = false;

let correctCharacters = 0;
let incorrectCharacters = 0;
let currentWPM = 0;
let currentAccuracy = 100;

// Stores the last accepted text in strict mode.
let lastAcceptedText = "";


// 4. STRICT MODE

function isStrictMode() {
    return selectedDifficulty === "Hard" ||
           selectedDifficulty === "Advanced";
}

function updateStrictModeUI() {
    if (!typingInput) return;

    typingInput.dataset.strict = String(isStrictMode());

    const instruction = document.querySelector(".typing-instruction");

    if (instruction) {
        instruction.innerHTML = isStrictMode()
            ? '<i class="fa-solid fa-lock"></i> Strict Mode: Backspace, deleting, pasting, and moving the cursor backward are disabled. Type carefully!'
            : '<i class="fa-solid fa-circle-info"></i> Your timer starts when you begin typing. Try to maintain both speed and accuracy.';
    }
}


// 5. RANDOM PASSAGE

function getRandomPassage() {
    const passages = typingPassages[selectedLanguage]?.[selectedDifficulty];

    if (!passages || passages.length === 0) {
        return "No typing passage is available for this selection.";
    }

    return passages[Math.floor(Math.random() * passages.length)];
}


// 6. DISPLAY PASSAGE

function displayTypingPassage() {
    if (!typingDisplay) return;

    typingDisplay.innerHTML = "";

    [...currentPassage].forEach((character, index) => {
        const span = document.createElement("span");
        span.textContent = character;
        span.dataset.index = index;

        if (index === 0) span.classList.add("current");

        typingDisplay.appendChild(span);
    });
}


// 7. UPDATE PROGRESS

function updateTypingProgress() {
    if (!typingInput || !typingDisplay) return;

    const typedText = typingInput.value;
    const characters = typingDisplay.querySelectorAll("span");

    correctCharacters = 0;
    incorrectCharacters = 0;

    characters.forEach((character, index) => {
        character.classList.remove("correct", "incorrect", "current");

        if (index < typedText.length) {
            if (typedText[index] === currentPassage[index]) {
                character.classList.add("correct");
                correctCharacters++;
            } else {
                character.classList.add("incorrect");
                incorrectCharacters++;
            }
        } else if (index === typedText.length && !testFinished) {
            character.classList.add("current");
        }
    });

    updateTypingStatistics();

    const progress = currentPassage.length
        ? Math.min((typedText.length / currentPassage.length) * 100, 100)
        : 0;

    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${Math.round(progress)}%`;

    const currentCharacter = typingDisplay.querySelector(".current");

    if (currentCharacter) {
        currentCharacter.scrollIntoView({
            block: "nearest",
            inline: "nearest"
        });
    }
}


// 8. STATISTICS

function updateTypingStatistics() {
    const elapsedTime = timeLimit - timeLeft;
    const minutes = elapsedTime / 60;

    currentWPM = minutes > 0
        ? Math.round((correctCharacters / 5) / minutes)
        : 0;

    const totalTyped = correctCharacters + incorrectCharacters;

    currentAccuracy = totalTyped > 0
        ? Math.round((correctCharacters / totalTyped) * 100)
        : 100;

    if (wpmDisplay) wpmDisplay.textContent = currentWPM;
    if (accuracyDisplay) accuracyDisplay.textContent = `${currentAccuracy}%`;
    if (errorsDisplay) errorsDisplay.textContent = incorrectCharacters;
}


// 9. TIMER

function startTypingTimer() {
    if (testStarted || testFinished) return;

    testStarted = true;

    timerInterval = setInterval(() => {
        timeLeft = Math.max(0, timeLeft - 1);

        if (timerDisplay) timerDisplay.textContent = timeLeft;

        updateTypingStatistics();

        if (timeLeft <= 0) finishTypingTest();
    }, 1000);
}


// 10. STRICT INPUT PROTECTION

if (typingInput) {
    typingInput.addEventListener("keydown", (event) => {
        if (!isStrictMode() || testFinished) {
            if (event.key.length === 1 || event.key === "Backspace") {
                playTypingSound();
            }
            return;
        }

        const blockedKeys = [
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowUp",
            "Home",
            "PageUp"
        ];

        const shortcut = event.ctrlKey || event.metaKey;

        if (
            blockedKeys.includes(event.key) ||
            (shortcut && ["a", "x", "v", "z", "y"].includes(event.key.toLowerCase())) ||
            event.key === "Tab"
        ) {
            event.preventDefault();
            return;
        }

        // Keep the cursor at the end of the accepted text.
        if (
            typingInput.selectionStart !== typingInput.value.length ||
            typingInput.selectionEnd !== typingInput.value.length
        ) {
            event.preventDefault();
            typingInput.setSelectionRange(
                typingInput.value.length,
                typingInput.value.length
            );
        }

        if (event.key.length === 1 || event.key === "Enter") {
            playTypingSound();
        }
    });

    // Block deleting, pasting, cutting, and replacing text.
    typingInput.addEventListener("beforeinput", (event) => {
        if (!isStrictMode() || testFinished) return;

        if (
            event.inputType.startsWith("delete") ||
            event.inputType === "insertFromPaste" ||
            event.inputType === "insertFromDrop" ||
            event.inputType === "insertReplacementText"
        ) {
            event.preventDefault();
        }
    });

    typingInput.addEventListener("paste", event => {
        if (isStrictMode()) event.preventDefault();
    });

    typingInput.addEventListener("cut", event => {
        if (isStrictMode()) event.preventDefault();
    });

    typingInput.addEventListener("drop", event => {
        if (isStrictMode()) event.preventDefault();
    });

    typingInput.addEventListener("contextmenu", event => {
        if (isStrictMode()) event.preventDefault();
    });

    // Prevent mouse clicks from moving the cursor backward.
    typingInput.addEventListener("click", () => {
        if (isStrictMode()) {
            const end = typingInput.value.length;
            typingInput.setSelectionRange(end, end);
        }
    });

    typingInput.addEventListener("select", () => {
        if (isStrictMode()) {
            const end = typingInput.value.length;
            if (
                typingInput.selectionStart !== end ||
                typingInput.selectionEnd !== end
            ) {
                typingInput.setSelectionRange(end, end);
            }
        }
    });

    typingInput.addEventListener("input", () => {
        if (testFinished) return;

        let typedText = typingInput.value;

        if (isStrictMode()) {
            // Strict mode only accepts new characters at the end.
            if (!typedText.startsWith(lastAcceptedText)) {
                typingInput.value = lastAcceptedText;
                return;
            }

            // Do not accept more than the displayed passage.
            if (typedText.length > currentPassage.length) {
                typedText = typedText.slice(0, currentPassage.length);
                typingInput.value = typedText;
            }

            lastAcceptedText = typedText;
        } else if (typedText.length > currentPassage.length) {
            typedText = typedText.slice(0, currentPassage.length);
            typingInput.value = typedText;
        }

        if (!testStarted && typedText.length > 0) {
            startTypingTimer();
        }

        updateTypingProgress();

        if (typedText.length === currentPassage.length) {
            finishTypingTest();
        }
    });
}


// 11. SOUND EFFECTS

let audioContext = null;

function playTypingSound() {
    let soundEnabled = true;

    try {
        const settings = JSON.parse(
            localStorage.getItem("praccode-settings") || "{}"
        );
        soundEnabled = settings.soundEffects !== false;
    } catch (error) {
        console.error("Unable to read sound settings:", error);
    }

    if (!soundEnabled) return;

    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        audioContext ||= new AudioContextClass();

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.frequency.value = 600;
        oscillator.type = "sine";

        gain.gain.setValueAtTime(0.025, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.04
        );

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.04);
    } catch (error) {
        console.error("Typing sound unavailable:", error);
    }
}


// 12. FINISH TEST

function finishTypingTest() {
    if (testFinished) return;

    testFinished = true;
    clearInterval(timerInterval);
    timerInterval = null;

    if (typingInput) typingInput.disabled = true;

    updateTypingStatistics();

    const timeUsed = Math.max(1, timeLimit - timeLeft);

    if (resultsContainer) {
        resultsContainer.hidden = false;

        resultsContainer.innerHTML = `
            <div class="typing-results-header">
                <i class="fa-solid fa-trophy"></i>
                <h2>Practice Completed!</h2>
                <p>Here is your typing performance.</p>
            </div>

            <div class="typing-results-stats">
                <div>
                    <span>Words Per Minute</span>
                    <h3>${currentWPM}</h3>
                </div>
                <div>
                    <span>Accuracy</span>
                    <h3>${currentAccuracy}%</h3>
                </div>
                <div>
                    <span>Total Errors</span>
                    <h3>${incorrectCharacters}</h3>
                </div>
            </div>

            <p id="typing-save-status">Saving your practice result...</p>

            <button type="button" id="typing-try-again">
                <i class="fa-solid fa-rotate-right"></i>
                Try Again
            </button>
        `;

        document.querySelector("#typing-try-again")
            ?.addEventListener("click", resetTypingTest);
    }

    saveTypingResult(timeUsed);
}


// 13. SAVE TO MYSQL

async function saveTypingResult(timeUsed) {
    if (resultSaved) return;
    resultSaved = true;

    const result = {
        language: selectedLanguage,
        difficulty: selectedDifficulty,
        duration_seconds: timeUsed,
        wpm: currentWPM,
        accuracy: currentAccuracy,
        errors: incorrectCharacters,
        date: new Date().toISOString()
    };

    let history = [];

    try {
        history = JSON.parse(
            localStorage.getItem("praccode-typing-history") || "[]"
        );

        if (!Array.isArray(history)) history = [];
    } catch {
        history = [];
    }

    history.unshift(result);

    try {
        localStorage.setItem(
            "praccode-typing-history",
            JSON.stringify(history.slice(0, 50))
        );
    } catch (error) {
        console.error("Local history save failed:", error);
    }

    const status = document.querySelector("#typing-save-status");

    try {
        const response = await fetch("https://praccode-api.joshuarabino7267.workers.dev/api/practice/sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                language: result.language,
                difficulty: result.difficulty,
                duration_seconds: result.duration_seconds,
                wpm: result.wpm,
                accuracy: result.accuracy,
                errors: result.errors
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to save practice session.");
        }

        console.log("Practice session saved to MySQL:", data);

        if (status) {
            status.textContent = "Your practice result was saved successfully!";
            status.style.color = "#86efac";
        }
    } catch (error) {
        console.error("MySQL practice save error:", error);

        if (status) {
            status.textContent =
                "Could not save your result. Check your login and server connection.";
            status.style.color = "#f87171";
        }
    }
}


// 14. RESET TEST

function resetTypingTest() {
    clearInterval(timerInterval);

    timerInterval = null;
    testStarted = false;
    testFinished = false;
    resultSaved = false;

    timeLeft = timeLimit;

    correctCharacters = 0;
    incorrectCharacters = 0;
    currentWPM = 0;
    currentAccuracy = 100;

    lastAcceptedText = "";

    currentPassage = getRandomPassage();

    if (typingInput) {
        typingInput.value = "";
        typingInput.disabled = false;
    }

    if (timerDisplay) timerDisplay.textContent = timeLeft;
    if (wpmDisplay) wpmDisplay.textContent = "0";
    if (accuracyDisplay) accuracyDisplay.textContent = "100%";
    if (errorsDisplay) errorsDisplay.textContent = "0";

    if (progressBar) progressBar.style.width = "0%";
    if (progressText) progressText.textContent = "0%";

    if (resultsContainer) {
        resultsContainer.hidden = true;
        resultsContainer.innerHTML = "";
    }

    updateStrictModeUI();
    displayTypingPassage();
}


// 15. RESET AND START BUTTONS

resetButton?.addEventListener("click", resetTypingTest);

startButton?.addEventListener("click", () => {
    if (testFinished) resetTypingTest();
    typingInput?.focus();
});


// 16. DIFFICULTY SELECTION

difficultyButtons.forEach(button => {
    button.addEventListener("click", () => {
        const difficulty = button.dataset.typingDifficulty;

        if (!typingPassages[selectedLanguage]?.[difficulty]) return;

        selectedDifficulty = difficulty;

        difficultyButtons.forEach(item => {
            item.classList.toggle("active", item === button);
        });

        resetTypingTest();
    });
});


// 17. LANGUAGE SELECTION

if (languageSelect) {
    languageSelect.addEventListener("change", () => {
        const language = languageSelect.value;

        if (!typingPassages[language]) {
            alert("No passages are available for this language.");
            languageSelect.value = selectedLanguage;
            return;
        }

        selectedLanguage = language;
        selectedDifficulty = "Easy";

        difficultyButtons.forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.typingDifficulty === "Easy"
            );
        });

        resetTypingTest();
    });
}


// 18. DURATION SELECTION

if (timerSelect) {
    timerSelect.addEventListener("change", () => {
        const duration = Number(timerSelect.value);

        if (![30, 60, 120, 180].includes(duration)) return;

        timeLimit = duration;
        resetTypingTest();
    });
}


// 19. CUSTOM CODE

function useCustomPassage(text) {
    if (!text || !text.trim()) {
        alert("The selected code is empty.");
        return;
    }

    if (text.length > 5000) {
        alert("Please use code with fewer than 5,000 characters.");
        return;
    }

    clearInterval(timerInterval);

    currentPassage = text.replace(/\r\n/g, "\n");
    selectedDifficulty = "Custom";

    difficultyButtons.forEach(button => {
        button.classList.remove("active");
    });

    resetTypingTestWithCustomPassage();
}

function resetTypingTestWithCustomPassage() {
    clearInterval(timerInterval);

    timerInterval = null;
    testStarted = false;
    testFinished = false;
    resultSaved = false;

    timeLeft = timeLimit;
    correctCharacters = 0;
    incorrectCharacters = 0;
    currentWPM = 0;
    currentAccuracy = 100;
    lastAcceptedText = "";

    if (typingInput) {
        typingInput.value = "";
        typingInput.disabled = false;
    }

    if (timerDisplay) timerDisplay.textContent = timeLeft;
    if (wpmDisplay) wpmDisplay.textContent = "0";
    if (accuracyDisplay) accuracyDisplay.textContent = "100%";
    if (errorsDisplay) errorsDisplay.textContent = "0";
    if (progressBar) progressBar.style.width = "0%";
    if (progressText) progressText.textContent = "0%";

    if (resultsContainer) {
        resultsContainer.hidden = true;
        resultsContainer.innerHTML = "";
    }

    updateStrictModeUI();
    displayTypingPassage();
}

useCustomCodeButton?.addEventListener("click", () => {
    useCustomPassage(customCodeInput?.value || "");
});


// 20. UPLOAD CODE FILES

if (codeFileInput) {
    codeFileInput.addEventListener("change", event => {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedExtensions = [
            ".txt", ".html", ".htm", ".css", ".js",
            ".py", ".java", ".c", ".cpp", ".h", ".hpp",
            ".cs", ".php", ".sql", ".ts", ".go",
            ".rb", ".swift", ".kt", ".kts", ".rs"
        ];

        const fileName = file.name.toLowerCase();

        if (!allowedExtensions.some(ext => fileName.endsWith(ext))) {
            alert("Unsupported file type. Please upload a supported programming file.");
            codeFileInput.value = "";
            return;
        }

        if (file.size > 100 * 1024) {
            alert("Please upload a file smaller than 100 KB.");
            codeFileInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result !== "string") return;

            useCustomPassage(reader.result);

            codeFileInput.value = "";
        };

        reader.onerror = () => {
            alert("Unable to read the selected file.");
            codeFileInput.value = "";
        };

        reader.readAsText(file);
    });
}


// 21. INITIALIZE

resetTypingTest();
