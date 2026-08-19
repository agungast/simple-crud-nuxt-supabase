<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="imageUrl"
        class="lightbox-overlay"
        @click="emit('close')"
        role="dialog"
        aria-modal="true"
        aria-label="Lightbox gambar"
      >
        <div class="lightbox-content" @click.stop>
          <img :src="imageUrl" alt="Tampilan gambar penuh" class="lightbox-img" />
          <button class="lightbox-close" @click="emit('close')" title="Tutup">×</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
// Props
defineProps({
  imageUrl: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits(['close'])
</script>

<style scoped>
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(3, 7, 18, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 85%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.lightbox-img {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.lightbox-close {
  position: absolute;
  top: -44px;
  right: 0;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #ffffff;
  font-size: 28px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  line-height: 0;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* Transition Animasi Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
