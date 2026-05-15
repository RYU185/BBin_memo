const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  memo: {
    getAll: () => ipcRenderer.invoke('memo:getAll'),
    getOne: (id) => ipcRenderer.invoke('memo:getOne', id),
    create: () => ipcRenderer.invoke('memo:create'),
    update: (id, changes) => ipcRenderer.invoke('memo:update', id, changes),
    delete: (id) => ipcRenderer.invoke('memo:delete', id),
  },
  window: {
    open: (memo_id) => ipcRenderer.invoke('window:open', memo_id),
    close: (memo_id) => ipcRenderer.invoke('window:close', memo_id),
    updateBounds: (memo_id, x, y, w, h) =>
      ipcRenderer.invoke('window:updateBounds', memo_id, x, y, w, h),
    restoreAll: () => ipcRenderer.invoke('window:restoreAll'),
  },
  app: {
    minimize: (memo_id) => ipcRenderer.invoke('app:minimize', memo_id),
    togglePin: (memo_id) => ipcRenderer.invoke('app:togglePin', memo_id),
    toggleGroup: (memo_id) => ipcRenderer.invoke('app:toggleGroup', memo_id),
    focusGroup: () => ipcRenderer.invoke('app:focusGroup'),
  },
  slash: {
    show: (data) => ipcRenderer.invoke('slash:show', data),
    hide: () => ipcRenderer.invoke('slash:hide'),
    update: (data) => ipcRenderer.invoke('slash:update', data),
    select: (cmdId) => ipcRenderer.invoke('slash:select', cmdId),
    onState: (cb) => {
      const fn = (_, s) => cb(s)
      ipcRenderer.on('slash:state', fn)
      return () => ipcRenderer.off('slash:state', fn)
    },
    onSelected: (cb) => {
      const fn = (_, id) => cb(id)
      ipcRenderer.on('slash:selected', fn)
      return () => ipcRenderer.off('slash:selected', fn)
    },
  },
  hub: {
    show: () => ipcRenderer.invoke('hub:show'),
  },
  self: {
    minimize: () => ipcRenderer.invoke('self:minimize'),
    close: () => ipcRenderer.invoke('self:close'),
  },
  getWindowParams: () => {
    const params = new URLSearchParams(window.location.search)
    return {
      type: params.get('window') || 'hub',
      memoId: params.get('id') || null,
    }
  },
})
