document.addEventListener("DOMContentLoaded", () => {
  const gate = document.getElementById("openingGate");
  const openButton = document.getElementById("openInvitation");

  function openInvitation() {
    if (!gate || gate.classList.contains("opened")) return;
    gate.classList.add("opened");

    setTimeout(() => {
      document.body.classList.remove("intro-lock");
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 720);

    setTimeout(() => {
      gate.setAttribute("aria-hidden", "true");
    }, 1500);
  }

  if (openButton) openButton.addEventListener("click", openInvitation);

  if (gate) {
    gate.addEventListener("click", (e) => {
      if (e.target.closest(".seal-button")) return;
      openInvitation();
    });
  }

  document.querySelectorAll(".scroll-cue").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.next);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const reveals = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("visible", entry.isIntersecting);
    });
  }, { threshold: 0.24 });

  reveals.forEach((el) => observer.observe(el));

  const depthLayers = document.querySelectorAll(".depth-layer");
  depthLayers.forEach((layer) => {
    layer.addEventListener("pointermove", (event) => {
      const rect = layer.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      layer.style.transform = `perspective(800px) rotateX(${y * -7}deg) rotateY(${x * 9}deg) translateZ(14px)`;
    });

    layer.addEventListener("pointerleave", () => {
      layer.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)";
    });
  });

  const snapPages = Array.from(document.querySelectorAll(".page"));
  let touchStartY = 0;
  let touchStartX = 0;
  let touchStartTime = 0;
  let snapLocked = false;

  function nearestPageIndex() {
    const viewportCenter = window.scrollY + window.innerHeight / 2;
    let bestIndex = 0;
    let bestDistance = Infinity;

    snapPages.forEach((page, index) => {
      const center = page.offsetTop + page.offsetHeight / 2;
      const distance = Math.abs(center - viewportCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  }

  function snapToPage(index) {
    if (!snapPages.length || snapLocked) return;

    index = Math.max(0, Math.min(snapPages.length - 1, index));
    snapLocked = true;
    snapPages[index].scrollIntoView({ behavior: "smooth", block: "start" });

    setTimeout(() => {
      snapLocked = false;
    }, 650);
  }

  document.addEventListener("touchstart", (event) => {
    if (!event.touches || event.touches.length !== 1) return;

    touchStartY = event.touches[0].clientY;
    touchStartX = event.touches[0].clientX;
    touchStartTime = Date.now();
  }, { passive: true });

  document.addEventListener("touchend", (event) => {
    if (document.body.classList.contains("intro-lock") || snapLocked) return;

    const touch = event.changedTouches && event.changedTouches[0];
    if (!touch) return;

    const dy = touchStartY - touch.clientY;
    const dx = touchStartX - touch.clientX;
    const elapsed = Date.now() - touchStartTime;

    if (Math.abs(dy) >= 24 && Math.abs(dy) > Math.abs(dx) * 1.15 && elapsed < 900) {
      const current = nearestPageIndex();
      snapToPage(dy > 0 ? current + 1 : current - 1);
    }
  }, { passive: true });

  const shareButton = document.getElementById("shareButton");

  if (shareButton) {
    shareButton.addEventListener("click", async () => {
      const shareData = {
        title: "कोंडा अशोक व परिवार | श्री गणेशोत्सव २०२६",
        text: "कोंडा अशोक व परिवाराच्या घरी लाडक्या बाप्पाचे १४ सप्टेंबर २०२६ रोजी २ दिवसांसाठी मंगल आगमन होत आहे. श्रींच्या दर्शनासाठी आपण कुटुंबियांसह आवर्जून उपस्थित राहावे.",
        url: window.location.href
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(window.location.href);
          alert("निमंत्रणाची लिंक कॉपी झाली आहे.");
        } else {
          alert("कृपया वेबसाइटची लिंक कॉपी करून शेअर करा.");
        }
      } catch (error) {
        console.log("Share cancelled:", error);
      }
    });
  }
});
