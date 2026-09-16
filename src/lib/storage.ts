// localStorage 读写封装。以后接云同步时，只需要替换这一层的实现。

export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return defaultValue
    return JSON.parse(raw) as T
  } catch (e) {
    console.warn(`[storage.get] 读取失败: ${key}`, e)
    return defaultValue
  }
}

export function setItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (e) {
    console.warn(`[storage.set] 写入失败: ${key}`, e)
    return false
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.warn(`[storage.remove] 删除失败: ${key}`, e)
  }
}
