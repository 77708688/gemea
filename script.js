document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Site carregado com sucesso!")

  // Importar Plyr
  const Plyr = window.Plyr
  // Importar Hls.js
  const Hls = window.Hls

  // Inicializar Plyr
  let player = null

  function initializePlayer() {
    try {
      // Configurações do Plyr
      const playerConfig = {
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
          "settings",
          "fullscreen",
        ],
        settings: ["quality", "speed"],
        quality: {
          default: 720,
          options: [1080, 720, 480, 360],
        },
        speed: {
          selected: 1,
          options: [0.5, 0.75, 1, 1.25, 1.5, 2],
        },
        ratio: "16:9",
        fullscreen: {
          enabled: true,
          fallback: true,
          iosNative: true,
        },
        captions: {
          active: false,
          language: "pt-BR",
        },
        keyboard: {
          focused: true,
          global: false,
        },
        tooltips: {
          controls: true,
          seek: true,
        },
        storage: {
          enabled: true,
          key: "chama-gemea-player",
        },
        // Configurações específicas para YouTube
        youtube: {
          noCookie: true,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1,
        },
        // Configurações específicas para Vimeo
        vimeo: {
          byline: false,
          portrait: false,
          title: false,
          speed: true,
          transparent: false,
        },
      }

      // Detectar tipo de player
      const playerElement = document.querySelector("#player")
      if (!playerElement) {
        console.error("❌ Elemento do player não encontrado")
        return
      }

      // Inicializar baseado no tipo
      if (playerElement.tagName === "VIDEO") {
        // Vídeo HTML5 (MP4, HLS, etc.)
        console.log("🎬 Inicializando player HTML5")
        player = new Plyr("#player", playerConfig)

        // Para HLS, você pode usar hls.js
        if (Hls && Hls.isSupported()) {
          const hls = new Hls()
          hls.loadSource(playerElement.querySelector("source").src)
          hls.attachMedia(playerElement)

          // Integrar com Plyr
          player.media = playerElement
        }
      } else if (playerElement.hasAttribute("data-plyr-provider")) {
        // YouTube ou Vimeo
        const provider = playerElement.getAttribute("data-plyr-provider")
        console.log(`🎬 Inicializando player ${provider}`)
        player = new Plyr("#player", playerConfig)
      } else if (playerElement.tagName === "IFRAME") {
        // ConvertAI ou outros iframes
        console.log("🎬 Player iframe detectado (ConvertAI)")

        // Para iframes, o Plyr tem limitações
        // Vamos criar controles customizados
        createCustomControls(playerElement)
      } else {
        console.warn("⚠️ Tipo de player não reconhecido")
      }

      // Event listeners do Plyr (se aplicável)
      if (player && typeof player.on === "function") {
        player.on("ready", () => {
          console.log("✅ Player inicializado com sucesso")
          trackEvent("video_player_ready")
        })

        player.on("play", () => {
          console.log("▶️ Vídeo iniciado")
          trackEvent("video_play")
        })

        player.on("pause", () => {
          console.log("⏸️ Vídeo pausado")
          trackEvent("video_pause")
        })

        player.on("ended", () => {
          console.log("🏁 Vídeo finalizado")
          trackEvent("video_ended")
        })

        player.on("error", (event) => {
          console.error("❌ Erro no player:", event)
          trackEvent("video_error", { error: event.detail })
        })
      }
    } catch (error) {
      console.error("❌ Erro ao inicializar player:", error)
      fallbackPlayer()
    }
  }

  // Função para criar controles customizados para iframes
  function createCustomControls(iframe) {
    const wrapper = iframe.parentElement

    // Criar overlay com controles básicos
    const overlay = document.createElement("div")
    overlay.className = "custom-controls"
    overlay.innerHTML = `
      <div class="custom-controls-overlay">
        <button class="custom-play-btn" aria-label="Reproduzir">
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="30" fill="rgba(0,0,0,0.7)"/>
            <path d="M23 18L38 30L23 42V18Z" fill="white"/>
          </svg>
        </button>
      </div>
    `

    wrapper.appendChild(overlay)

    // Event listener para o botão customizado
    const playBtn = overlay.querySelector(".custom-play-btn")
    playBtn.addEventListener("click", () => {
      // Tentar interagir com o iframe
      iframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', "*")
      overlay.style.display = "none"
      trackEvent("custom_video_play")
    })
  }

  // Fallback para quando o Plyr não funciona
  function fallbackPlayer() {
    console.log("🔄 Usando player fallback")
    const playerElement = document.querySelector("#player")

    if (playerElement && playerElement.tagName === "IFRAME") {
      // Para ConvertAI, apenas garantir que o iframe funcione
      playerElement.onload = () => {
        console.log("✅ Iframe carregado com sucesso")
        document.querySelector(".video-wrapper")?.classList.remove("loading")
      }
    }
  }

  // Função para trocar fonte do vídeo dinamicamente
  function changeVideoSource(newSource, type = "video/mp4") {
    if (player && player.source) {
      player.source = {
        type: "video",
        sources: [
          {
            src: newSource,
            type: type,
          },
        ],
      }
    }
  }

  // Função para trocar para YouTube
  function loadYouTubeVideo(videoId) {
    if (player && player.source) {
      player.source = {
        type: "video",
        sources: [
          {
            src: videoId,
            provider: "youtube",
          },
        ],
      }
    }
  }

  // Função para trocar para Vimeo
  function loadVimeoVideo(videoId) {
    if (player && player.source) {
      player.source = {
        type: "video",
        sources: [
          {
            src: videoId,
            provider: "vimeo",
          },
        ],
      }
    }
  }

  // Inicializar player após um pequeno delay
  setTimeout(initializePlayer, 500)

  // Animações de entrada
  function animateElements() {
    const delayElements = document.querySelectorAll(".delay-animation")

    delayElements.forEach((element, index) => {
      setTimeout(
        () => {
          element.style.opacity = "1"
          element.style.transform = "translateY(0)"
        },
        (index + 1) * 500,
      )
    })
  }

  // Iniciar animações
  setTimeout(animateElements, 1000)

  // Botões CTA com efeitos melhorados
  const ctaButtons = document.querySelectorAll(".cta-button")

  ctaButtons.forEach((button, index) => {
    // Efeito de clique
    button.addEventListener("click", function (e) {
      this.style.transform = "scale(0.95)"

      setTimeout(() => {
        this.style.transform = ""
      }, 150)

      // Tracking
      trackEvent("cta_button_clicked", {
        button_index: index + 1,
        button_text: this.textContent.trim(),
        timestamp: new Date().toISOString(),
      })
    })

    // Efeitos hover melhorados
    button.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-3px)"
    })

    button.addEventListener("mouseleave", function () {
      this.style.transform = ""
    })

    // Efeito de foco para acessibilidade
    button.addEventListener("focus", function () {
      this.style.boxShadow = "0 0 0 3px rgba(0, 191, 99, 0.5)"
    })

    button.addEventListener("blur", function () {
      this.style.boxShadow = ""
    })
  })

  // Intersection Observer para animações ao scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in")
      }
    })
  }, observerOptions)

  // Observar elementos para animação
  const elementsToAnimate = document.querySelectorAll(".chat-section, .reading-image-container, .video-container")
  elementsToAnimate.forEach((el) => observer.observe(el))

  // Função para tracking de eventos
  function trackEvent(eventName, eventData = {}) {
    console.log("📊 Event tracked:", eventName, eventData)

    // Google Analytics 4
    const gtag = window.gtag
    if (typeof gtag !== "undefined") {
      gtag("event", eventName, {
        custom_parameter: eventData,
        page_title: document.title,
        page_location: window.location.href,
      })
    }

    // Facebook Pixel
    const fbq = window.fbq
    if (typeof fbq !== "undefined") {
      fbq("track", eventName, eventData)
    }

    // Você pode adicionar outros sistemas de analytics aqui
    // Exemplo: Hotjar, Mixpanel, etc.
  }

  // Preload de recursos importantes
  function preloadResources() {
    const resourcesToPreload = [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LEITURA-6-2-UdGAff22X3yjkmHdQwWkJDjqNypilC.webp",
        type: "image",
      },
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fundo-5A2ERFBAWsYyH3sz9RUBsLrtd6uK4Z.webp",
        type: "image",
      },
      {
        url: "https://web.chamagemeasua.online/serena-9dbfxgo",
        type: "link",
      },
    ]

    resourcesToPreload.forEach(({ url, type }) => {
      if (type === "image") {
        const img = new Image()
        img.src = url
        img.onload = () => console.log("🖼️ Imagem precarregada:", url)
        img.onerror = () => console.warn("⚠️ Erro ao precarregar imagem:", url)
      } else if (type === "link") {
        const link = document.createElement("link")
        link.rel = "prefetch"
        link.href = url
        document.head.appendChild(link)
      }
    })
  }

  // Iniciar preload
  preloadResources()

  // Otimizações para dispositivos móveis
  function optimizeForMobile() {
    const isMobile = window.innerWidth <= 768

    if (isMobile) {
      document.body.classList.add("mobile-optimized")

      // Lazy loading para imagens não críticas
      const images = document.querySelectorAll("img:not([loading])")
      images.forEach((img) => {
        img.loading = "lazy"
      })

      // Reduzir qualidade de animações
      document.documentElement.style.setProperty("--animation-duration", "0.3s")
    } else {
      document.body.classList.remove("mobile-optimized")
      document.documentElement.style.setProperty("--animation-duration", "0.6s")
    }
  }

  // Executar otimizações
  optimizeForMobile()

  // Re-executar em resize com debounce
  let resizeTimeout
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(optimizeForMobile, 250)
  })

  // Melhorias de performance
  function improvePerformance() {
    // Debounce para scroll
    let scrollTimeout
    window.addEventListener("scroll", () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        // Código de scroll aqui se necessário
      }, 100)
    })

    // Prefetch de recursos críticos
    const criticalResources = ["https://cdn.plyr.io/3.7.8/plyr.css", "https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"]

    criticalResources.forEach((url) => {
      const link = document.createElement("link")
      link.rel = "prefetch"
      link.href = url
      document.head.appendChild(link)
    })
  }

  // Executar melhorias
  improvePerformance()

  // Verificar conectividade
  function checkConnection() {
    const isOnline = navigator.onLine

    if (isOnline) {
      console.log("🌐 Conectado à internet")
      document.body.classList.remove("offline")
    } else {
      console.log("📵 Sem conexão com a internet")
      document.body.classList.add("offline")
    }

    return isOnline
  }

  // Verificar conexão inicial
  checkConnection()

  // Monitorar mudanças de conectividade
  window.addEventListener("online", () => {
    checkConnection()
    trackEvent("connection_restored")
  })

  window.addEventListener("offline", () => {
    checkConnection()
    trackEvent("connection_lost")
  })

  // Tratamento de erros global
  window.addEventListener("error", (e) => {
    console.error("❌ Erro global detectado:", e.error)
    trackEvent("javascript_error", {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
    })
  })

  // Verificar se todos os recursos foram carregados
  window.addEventListener("load", () => {
    console.log("✅ Todos os recursos foram carregados!")
    document.body.classList.add("fully-loaded")
    trackEvent("page_fully_loaded", {
      load_time: performance.now(),
    })
  })

  // Service Worker para cache (opcional)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✅ SW registrado:", registration)
        })
        .catch((registrationError) => {
          console.log("❌ Falha no registro do SW:", registrationError)
        })
    })
  }

  // Cleanup ao sair da página
  window.addEventListener("beforeunload", () => {
    if (player) {
      player.destroy()
    }
  })

  console.log("🎉 Script inicializado com sucesso!")
})

// Função utilitária para detectar dispositivo
function getDeviceType() {
  const width = window.innerWidth
  if (width < 480) return "mobile-small"
  if (width < 768) return "mobile"
  if (width < 1024) return "tablet"
  if (width < 1200) return "desktop"
  return "desktop-large"
}

// Função para otimizar imagens baseado no dispositivo
function optimizeImages() {
  const deviceType = getDeviceType()
  const images = document.querySelectorAll("img[data-src]")

  images.forEach((img) => {
    let src = img.dataset.src

    // Ajustar qualidade baseado no dispositivo
    if (deviceType.includes("mobile")) {
      src += "?w=800&q=75"
    } else if (deviceType === "tablet") {
      src += "?w=1200&q=80"
    } else {
      src += "?w=1600&q=85"
    }

    img.src = src
  })
}

// Executar otimização de imagens
document.addEventListener("DOMContentLoaded", optimizeImages)

// Exemplos de uso das funções:

// Para trocar para um vídeo MP4:
// changeVideoSource('https://exemplo.com/video.mp4')

// Para trocar para YouTube:
// loadYouTubeVideo('dQw4w9WgXcQ')

// Para trocar para Vimeo:
// loadVimeoVideo('76979871')
