// called when user requests previous tag (from StoryViewer)
function handleTagPrev() {
  if (currentTagIndex == null) {
    setStoryOpen(false)
    return
  }
  let prevIndex = currentTagIndex - 1
  if (prevIndex < 0) {
    // no previous tag in sequence -> close viewer
    setStoryOpen(false)
    setCurrentTagIndex(null)
    setTagOrder([])
    return
  }
  let foundIndex = prevIndex
  while (foundIndex >= 0) {
    const p = buildPostsForTag(tagOrder[foundIndex])
    if (p.length > 0) {
      setStoryPosts(p)
      setStoryIndex(p.length - 1) // start at last post of that tag
      setCurrentTagIndex(foundIndex)
      return
    }
    foundIndex--
  }
  // nothing found -> close
  setStoryOpen(false)
  setCurrentTagIndex(null)
  setTagOrder([])
}