<template>
  <div v-if="collaborationStore.showRemoteCursors" class="live-cursors-layer">
    <!-- Remote Cursors -->
    <div
      v-for="c in collaborationStore.otherCursors"
      :key="c.userId"
      class="remote-cursor"
      :style="{
        left: `${c.xPercent}%`,
        top: `${c.yPercent}%`
      }"
    >
      <!-- Cursor Pointer SVG -->
      <svg
        class="cursor-icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          :fill="c.color"
          :stroke="'#0f172a'"
          stroke-width="1.5"
        />
      </svg>

      <!-- Cursor Name Tag Pill -->
      <div
        class="cursor-tag"
        :style="{
          backgroundColor: c.color,
          boxShadow: `0 2px 10px ${c.color}40`
        }"
      >
        <span class="cursor-name">{{ c.userName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useCollaborationStore } from '~/stores/collaborationStore'

const collaborationStore = useCollaborationStore()

// Tangkap pergerakan mouse lokal dan kirim broadcast
const handleMouseMove = (e: MouseEvent) => {
  // Hitung posisi kursor dalam persentase viewport (0 - 100%)
  const xPercent = (e.clientX / window.innerWidth) * 100
  const yPercent = (e.clientY / window.innerHeight) * 100

  collaborationStore.broadcastCursor(xPercent, yPercent)
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style scoped>
.live-cursors-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.remote-cursor {
  position: absolute;
  transform: translate(-2px, -2px);
  transition: left 0.08s cubic-bezier(0, 0, 0.2, 1), top 0.08s cubic-bezier(0, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  will-change: left, top;
}

.cursor-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.cursor-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 6px;
  margin-top: -2px;
  margin-left: 12px;
  white-space: nowrap;
}

.cursor-name {
  font-size: 10px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.2px;
}
</style>
