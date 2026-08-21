<template>
  <Transition name="slide-fade">
    <div v-if="collaborationStore.activeTypers.length > 0" class="live-typing-banner">
      <div class="typing-icon-wrap">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      </div>

      <div class="typing-content">
        <!-- Bouncing dots animation -->
        <div class="bouncing-dots">
          <span class="dot dot-1"></span>
          <span class="dot dot-2"></span>
          <span class="dot dot-3"></span>
        </div>

        <span class="typing-text">
          <strong
            class="typer-name"
            :style="{ color: firstTyper?.color || '#818cf8' }"
          >
            {{ firstTyper?.userName }}
          </strong>
          <span v-if="otherTypersCount > 0" class="others-count">
            dan {{ otherTypersCount }} lainnya
          </span>
          sedang mengetik
          <span v-if="firstTyper?.textPreview" class="text-preview">
            "{{ firstTyper.textPreview }}..."
          </span>
        </span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCollaborationStore } from '~/stores/collaborationStore'

const collaborationStore = useCollaborationStore()

const firstTyper = computed(() => collaborationStore.activeTypers[0])
const otherTypersCount = computed(() => Math.max(0, collaborationStore.activeTypers.length - 1))
</script>

<style scoped>
.live-typing-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(99, 102, 241, 0.35);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 12px rgba(99, 102, 241, 0.2);
  padding: 8px 16px;
  border-radius: 30px;
  backdrop-filter: blur(10px);
  width: fit-content;
  margin: 0 auto;
}

.typing-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #818cf8;
}

.typing-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #cbd5e1;
}

.bouncing-dots {
  display: flex;
  align-items: center;
  gap: 3px;
}

.dot {
  width: 4px;
  height: 4px;
  background-color: #818cf8;
  border-radius: 50%;
  animation: typing-bounce 1.4s infinite ease-in-out both;
}

.dot-1 {
  animation-delay: -0.32s;
}

.dot-2 {
  animation-delay: -0.16s;
}

.dot-3 {
  animation-delay: 0s;
}

@keyframes typing-bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

.typer-name {
  font-weight: 700;
}

.others-count {
  font-weight: 600;
  color: #94a3b8;
}

.text-preview {
  color: #94a3b8;
  font-style: italic;
  font-size: 12px;
}

/* ─── ANIMATION ───────────────────────────────────────────────────────────── */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>
