from collections import defaultdict


class TrieNode:
    def __init__(self):
        self.children: dict[str, "TrieNode"] = {}
        self.is_end = False
        self.event_ids: set[int] = set()


class EventTrie:
    def __init__(self):
        self.root = TrieNode()
        self.prefix_cache: dict[str, list[int]] = defaultdict(list)

    def insert(self, text: str, event_id: int) -> None:
        node = self.root
        normalized = text.strip().lower()
        for ch in normalized:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
            node.event_ids.add(event_id)
        node.is_end = True

    def search_prefix(self, prefix: str, limit: int = 10) -> list[int]:
        normalized = prefix.strip().lower()
        if normalized in self.prefix_cache:
            return self.prefix_cache[normalized][:limit]

        node = self.root
        for ch in normalized:
            if ch not in node.children:
                return []
            node = node.children[ch]

        result = list(node.event_ids)[:limit]
        self.prefix_cache[normalized] = result
        return result


event_trie = EventTrie()
