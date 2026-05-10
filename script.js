(function () {
  const data = window.INVITATION;

  const setText = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  };

  const setImage = (id, src, alt) => {
    const image = document.getElementById(id);
    if (!image) return;
    image.src = src;
    image.alt = alt;
    image.onerror = () => {
      image.classList.add("is-missing");
      image.removeAttribute("src");
    };
  };

  const blockZoomGestures = () => {
    document.addEventListener("gesturestart", (event) => event.preventDefault());
    document.addEventListener(
      "touchmove",
      (event) => {
        if (event.touches.length > 1) event.preventDefault();
      },
      { passive: false }
    );
  };

  const initScrollEffects = () => {
    const animatedItems = document.querySelectorAll(
      ".section, .calendar-card, .kakao-map, .way-info, .gallery, .account-item"
    );

    animatedItems.forEach((item, index) => {
      item.classList.add("reveal-item");
      item.style.setProperty("--reveal-delay", `${Math.min(index * 45, 220)}ms`);
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
        },
        {
          rootMargin: "0px 0px -12% 0px",
          threshold: 0.16
        }
      );

      animatedItems.forEach((item) => observer.observe(item));
    } else {
      animatedItems.forEach((item) => item.classList.add("is-visible"));
    }

    const hero = document.querySelector(".hero");
    const heroPhoto = document.querySelector(".hero-photo");
    if (!hero || !heroPhoto) return;

    const updateHero = () => {
      const progress = Math.min(window.scrollY / Math.max(hero.offsetHeight, 1), 1);
      hero.style.setProperty("--hero-fade", progress.toFixed(3));
      heroPhoto.style.setProperty("--hero-shift", `${progress * 34}px`);
    };

    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
          updateHero();
          ticking = false;
        });
      },
      { passive: true }
    );

    updateHero();
  };

  setText("groomName", data.groom.name);
  setText("brideName", data.bride.name);
  setText("groomNameDetail", data.groom.name);
  setText("brideNameDetail", data.bride.name);
  setText("groomParents", data.groom.parents);
  setText("brideParents", data.bride.parents);
  setText("weddingDateText", data.wedding.dateShort);
  setText("weddingDateDetail", data.wedding.dateLong);
  setText("venueName", data.wedding.venue);
  setText("venueAddress", data.wedding.address);
  setText("messageText", data.message);
  setText("parkingGuide", data.wedding.parkingGuide);
  setImage("coverPhoto", data.coverPhoto, `${data.groom.name} ${data.bride.name} 대표 사진`);

  const renderDirections = () => {
    const list = document.getElementById("directionsList");
    if (!list) return;

    const directions = data.wedding.directions || [];
    list.innerHTML = "";
    directions.forEach((direction) => {
      const item = document.createElement("li");
      item.textContent = direction;
      list.appendChild(item);
    });
  };

  const getMapLinks = () => {
    const name = encodeURIComponent(data.wedding.venue);
    const lat = data.wedding.latitude;
    const lng = data.wedding.longitude;

    return {
      kakao: data.wedding.mapUrl,
      naver: `nmap://route/car?dlat=${lat}&dlng=${lng}&dname=${name}&appname=heesooedu.github.io.card`,
      tmap: `tmap://route?goalname=${name}&goalx=${lng}&goaly=${lat}`
    };
  };

  const renderMapActions = () => {
    const links = getMapLinks();
    const kakaoMapLink = document.getElementById("kakaoMapLink");
    const naverMapLink = document.getElementById("naverMapLink");
    const tmapLink = document.getElementById("tmapLink");

    if (kakaoMapLink) kakaoMapLink.href = links.kakao;
    if (naverMapLink) naverMapLink.href = links.naver;
    if (tmapLink) tmapLink.href = links.tmap;
  };

  const renderCalendar = () => {
    const monthElement = document.getElementById("calendarMonth");
    const dayElement = document.getElementById("calendarDay");
    const gridElement = document.getElementById("calendarGrid");
    if (!monthElement || !dayElement || !gridElement || !data.wedding.dateISO) return;

    const weddingDate = new Date(`${data.wedding.dateISO}T00:00:00`);
    const year = weddingDate.getFullYear();
    const month = weddingDate.getMonth();
    const day = weddingDate.getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    monthElement.textContent = `${year}. ${String(month + 1).padStart(2, "0")}`;
    dayElement.textContent = String(day);
    gridElement.innerHTML = "";

    for (let index = 0; index < firstDay; index += 1) {
      gridElement.appendChild(document.createElement("span"));
    }

    for (let date = 1; date <= lastDate; date += 1) {
      const cell = document.createElement("span");
      cell.textContent = String(date);
      if (date === day) cell.className = "is-wedding-day";
      gridElement.appendChild(cell);
    }
  };

  const renderKakaoMap = () => {
    const mapElement = document.getElementById("kakaoMap");
    const appKey = data.wedding.kakaoAppKey;
    if (!mapElement) return;

    const links = getMapLinks();
    const fallbackLink = `<a class="map-fallback-link" href="${links.kakao}" target="_blank" rel="noreferrer">카카오맵에서 보기</a>`;

    if (!appKey || appKey === "YOUR_KAKAO_JAVASCRIPT_KEY") {
      mapElement.innerHTML = `<div class="map-message"><p>config.js에 카카오 JavaScript 키를 입력해 주세요.</p>${fallbackLink}</div>`;
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const fallbackPosition = new window.kakao.maps.LatLng(data.wedding.latitude, data.wedding.longitude);
        const map = new window.kakao.maps.Map(mapElement, {
          center: fallbackPosition,
          level: 3
        });

        const marker = new window.kakao.maps.Marker({
          map,
          position: fallbackPosition
        });

        const placeId = data.wedding.mapUrl.split("/").pop();
        const places = new window.kakao.maps.services.Places();
        places.keywordSearch(data.wedding.venue, (results, status) => {
          if (status !== window.kakao.maps.services.Status.OK) return;

          const place = results.find((result) => result.id === placeId) || results[0];
          if (!place) return;

          const position = new window.kakao.maps.LatLng(Number(place.y), Number(place.x));
          marker.setPosition(position);
          map.setCenter(position);
        });

        window.kakao.maps.event.addListener(marker, "click", () => {
          window.open(links.kakao, "_blank", "noreferrer");
        });
      });
    };
    script.onerror = () => {
      mapElement.innerHTML = `<div class="map-message"><p>카카오맵을 불러오지 못했습니다. Kakao Developers의 JavaScript SDK 도메인 설정을 확인해 주세요.</p>${fallbackLink}</div>`;
    };

    document.head.appendChild(script);
  };

  blockZoomGestures();
  renderDirections();
  renderMapActions();
  renderCalendar();
  renderKakaoMap();

  const gallery = document.getElementById("gallery");
  if (gallery) {
    let renderedCount = 0;
    let activePhotoIndex = 0;
    const photos = data.photos.filter(Boolean);

    gallery.innerHTML = `
      <div id="galleryGrid" class="gallery-grid"></div>
      <button id="loadMorePhotos" class="gallery-more" type="button"></button>
      <div id="galleryViewer" class="gallery-viewer" aria-hidden="true">
        <div class="gallery-viewer-backdrop"></div>
        <div class="gallery-viewer-panel" role="dialog" aria-modal="true" aria-label="사진 크게 보기">
          <button id="closeGalleryViewer" class="gallery-viewer-close" type="button" aria-label="닫기">×</button>
          <button id="viewerPrevPhoto" class="gallery-viewer-nav prev" type="button" aria-label="이전 사진">‹</button>
          <figure class="gallery-viewer-frame">
            <img id="viewerPhoto" alt="" draggable="false" />
          </figure>
          <button id="viewerNextPhoto" class="gallery-viewer-nav next" type="button" aria-label="다음 사진">›</button>
          <span id="viewerCount" class="gallery-viewer-count"></span>
        </div>
      </div>
    `;

    const galleryGrid = document.getElementById("galleryGrid");
    const loadMorePhotos = document.getElementById("loadMorePhotos");
    const galleryViewer = document.getElementById("galleryViewer");
    const viewerPhoto = document.getElementById("viewerPhoto");
    const viewerCount = document.getElementById("viewerCount");
    const closeGalleryViewer = document.getElementById("closeGalleryViewer");
    const viewerPrevPhoto = document.getElementById("viewerPrevPhoto");
    const viewerNextPhoto = document.getElementById("viewerNextPhoto");

    const showViewerPhoto = () => {
      if (!viewerPhoto || !viewerCount) return;
      viewerPhoto.src = photos[activePhotoIndex];
      viewerPhoto.alt = `${data.groom.name} ${data.bride.name} 사진 ${activePhotoIndex + 1}`;
      viewerCount.textContent = `${activePhotoIndex + 1} / ${photos.length}`;
    };

    const openViewer = (index) => {
      if (!galleryViewer || photos.length === 0) return;
      activePhotoIndex = index;
      showViewerPhoto();
      galleryViewer.classList.add("is-open");
      galleryViewer.setAttribute("aria-hidden", "false");
      document.body.classList.add("viewer-open");
    };

    const closeViewer = () => {
      if (!galleryViewer) return;
      galleryViewer.classList.remove("is-open");
      galleryViewer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("viewer-open");
    };

    const moveViewer = (direction) => {
      activePhotoIndex = (activePhotoIndex + direction + photos.length) % photos.length;
      showViewerPhoto();
    };

    const appendPhotos = (nextCount = 9) => {
      if (!galleryGrid || !loadMorePhotos) return;

      const nextVisibleCount = Math.min(renderedCount + nextCount, photos.length);
      photos.slice(renderedCount, nextVisibleCount).forEach((photo, offset) => {
        const index = renderedCount + offset;
        const button = document.createElement("button");
        button.className = "gallery-thumb";
        button.type = "button";
        button.setAttribute("aria-label", `${index + 1}번째 사진`);

        const image = document.createElement("img");
        image.src = photo;
        image.alt = `${data.groom.name} ${data.bride.name} 사진 ${index + 1}`;
        image.loading = index < 9 ? "eager" : "lazy";
        image.decoding = "async";
        image.draggable = false;

        button.appendChild(image);
        button.addEventListener("click", () => {
          galleryGrid.querySelectorAll(".gallery-thumb").forEach((thumb) => {
            thumb.classList.remove("is-selected");
          });
          button.classList.add("is-selected");
          openViewer(index);
        });

        galleryGrid.appendChild(button);
      });

      renderedCount = nextVisibleCount;
      updateGalleryButton();
    };

    const collapseGallery = () => {
      if (!galleryGrid || !loadMorePhotos) return;
      renderedCount = 0;
      galleryGrid.innerHTML = "";
      appendPhotos(9);
      gallery.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const updateGalleryButton = () => {
      const remainingCount = Math.max(photos.length - renderedCount, 0);
      loadMorePhotos.hidden = photos.length <= 9;
      loadMorePhotos.dataset.mode = remainingCount === 0 ? "collapse" : "more";
      loadMorePhotos.textContent =
        remainingCount === 0 ? "접기" : `더보기 ${remainingCount > 0 ? `(${remainingCount})` : ""}`;
    };

    loadMorePhotos.addEventListener("click", () => {
      if (loadMorePhotos.dataset.mode === "collapse") {
        collapseGallery();
        return;
      }
      appendPhotos(9);
    });

    closeGalleryViewer.addEventListener("click", closeViewer);
    viewerPrevPhoto.addEventListener("click", () => moveViewer(-1));
    viewerNextPhoto.addEventListener("click", () => moveViewer(1));
    galleryViewer.addEventListener("click", (event) => {
      if (event.target === galleryViewer || event.target.classList.contains("gallery-viewer-backdrop")) {
        closeViewer();
      }
    });

    let viewerTouchStartX = 0;
    galleryViewer.addEventListener("touchstart", (event) => {
      viewerTouchStartX = event.changedTouches[0].clientX;
    });

    galleryViewer.addEventListener("touchend", (event) => {
      const touchEndX = event.changedTouches[0].clientX;
      const distance = touchEndX - viewerTouchStartX;
      if (Math.abs(distance) < 45) return;
      moveViewer(distance > 0 ? -1 : 1);
    });

    document.addEventListener("keydown", (event) => {
      if (!galleryViewer.classList.contains("is-open")) return;
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") moveViewer(-1);
      if (event.key === "ArrowRight") moveViewer(1);
    });

    appendPhotos(9);
  }

  const accounts = document.getElementById("accounts");
  if (accounts) {
    [
      ["신랑측", data.groom.account],
      ["신부측", data.bride.account]
    ].forEach(([label, account]) => {
      const item = document.createElement("div");
      item.className = "account-item";
      item.innerHTML = `<span>${label}</span><strong>${account}</strong>`;
      accounts.appendChild(item);
    });
  }

  initScrollEffects();
})();
