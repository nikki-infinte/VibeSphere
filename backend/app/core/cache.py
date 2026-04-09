from collections.abc import Callable
from dataclasses import dataclass
from threading import RLock
from time import time
from typing import Generic, TypeVar

K = TypeVar("K")
V = TypeVar("V")


@dataclass
class _Node(Generic[K, V]):
    key: K
    value: V
    expires_at: float
    prev: "_Node[K, V] | None" = None
    next: "_Node[K, V] | None" = None


class LRUCache(Generic[K, V]):
    """O(1) average get/put using HashMap + doubly linked list."""

    def __init__(self, capacity: int = 256, ttl_seconds: int = 60):
        self.capacity = capacity
        self.ttl_seconds = ttl_seconds
        self.map: dict[K, _Node[K, V]] = {}
        self.head = _Node(None, None, 0)  # type: ignore[arg-type]
        self.tail = _Node(None, None, 0)  # type: ignore[arg-type]
        self.head.next = self.tail
        self.tail.prev = self.head
        self.lock = RLock()

    def _add_to_front(self, node: _Node[K, V]) -> None:
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node  # type: ignore[union-attr]
        self.head.next = node

    def _remove(self, node: _Node[K, V]) -> None:
        node.prev.next = node.next  # type: ignore[union-attr]
        node.next.prev = node.prev  # type: ignore[union-attr]

    def _is_expired(self, node: _Node[K, V]) -> bool:
        return node.expires_at < time()

    def get(self, key: K) -> V | None:
        with self.lock:
            node = self.map.get(key)
            if not node:
                return None
            if self._is_expired(node):
                self._remove(node)
                del self.map[key]
                return None
            self._remove(node)
            self._add_to_front(node)
            return node.value

    def put(self, key: K, value: V) -> None:
        with self.lock:
            existing = self.map.get(key)
            if existing:
                existing.value = value
                existing.expires_at = time() + self.ttl_seconds
                self._remove(existing)
                self._add_to_front(existing)
                return

            node = _Node(key=key, value=value, expires_at=time() + self.ttl_seconds)
            self.map[key] = node
            self._add_to_front(node)

            if len(self.map) > self.capacity:
                lru = self.tail.prev
                if lru and lru is not self.head:
                    self._remove(lru)
                    del self.map[lru.key]

    def cached(self, key_builder: Callable[..., K]):
        def decorator(func: Callable[..., V]):
            def wrapper(*args, **kwargs):
                key = key_builder(*args, **kwargs)
                cached_val = self.get(key)
                if cached_val is not None:
                    return cached_val
                val = func(*args, **kwargs)
                self.put(key, val)
                return val

            return wrapper

        return decorator
