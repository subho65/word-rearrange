// Import the dictionary.js file at the top of the worker.js
importScripts('https://rawcdn.githack.com/subho65/subhojati/refs/heads/main/dictionary.js'); // This imports the dictionary into the worker context

// Trie and TrieNode classes
class TrieNode {
    constructor() {
        this.children = {};
        this.isWord = false;
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word) {
        let node = this.root;
        for (let char of word) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isWord = true;
    }

    search(word) {
        let node = this.root;
        for (let char of word) {
            if (!node.children[char]) {
                return false;
            }
            node = node.children[char];
        }
        return node.isWord;
    }

    startsWith(prefix) {
        let node = this.root;
        for (let char of prefix) {
            if (!node.children[char]) {
                return false;
            }
            node = node.children[char];
        }
        return true;
    }
}

// Insert words into the Trie
const trie = new Trie();  // Create an instance of the Trie
dictionary.forEach(word => trie.insert(word));  // Insert each word from the dictionary into the Trie

// Helper function to count the frequency of characters in a word
function getCharCount(word) {
    const charCount = {};
    for (let char of word) {
        charCount[char] = (charCount[char] || 0) + 1;
    }
    return charCount;
}

// Function to compare two character count objects
function isAnagram(wordCharCount, generatedWord) {
    const generatedWordCharCount = getCharCount(generatedWord);
    if (Object.keys(wordCharCount).length !== Object.keys(generatedWordCharCount).length) {
        return false;
    }
    for (let char in wordCharCount) {
        if (wordCharCount[char] !== generatedWordCharCount[char]) {
            return false;
        }
    }
    return true;
}

// Function to rearrange words and find meaningful words in the Trie
function rearrange(word, path = "", visited = new Array(word.length).fill(false), result = new Set()) {
    if (path.length === word.length && trie.search(path)) {
        result.add(path);
    }

    for (let i = 0; i < word.length; i++) {
        if (!visited[i]) {
            const newPath = path + word[i];
            if (trie.startsWith(newPath)) {
                visited[i] = true;
                rearrange(word, newPath, visited, result);
                visited[i] = false;
            }
        }
    }

    return result;
}

self.onmessage = function(event) {
    const { inputWord } = event.data;

    const inputCharCount = getCharCount(inputWord);

    const meaningfulWords = Array.from(rearrange(inputWord))
        .filter(word => word.length === inputWord.length && isAnagram(inputCharCount, word)) // Filter by length and character count
        .sort((a, b) => b.length - a.length) // Sort by length, descending
        .slice(0, 50); // Limit to top 50 results

    self.postMessage(meaningfulWords);
};
