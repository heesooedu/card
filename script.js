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
  setImage("coverPhoto", data.coverPhoto, `${data.groom.name} ${data.bride.name} 대표 사진`);

  const mapLink = document.getElementById("mapLink");
  if (mapLink) mapLink.href = data.wedding.mapUrl;

  const copyAddress = document.getElementById("copyAddress");
  if (copyAddress) {
    copyAddress.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(data.wedding.address);
        copyAddress.textContent = "복사 완료";
        window.setTimeout(() => {
          copyAddress.textContent = "주소 복사";
        }, 1600);
      } catch {
        copyAddress.textContent = "복사 실패";
      }
    });
  }

  const gallery = document.getElementById("gallery");
  if (gallery) {
    gallery.innerHTML = "";
    data.photos.forEach((photo, index) => {
      const figure = document.createElement("figure");
      const image = document.createElement("img");
      image.src = photo;
      image.alt = `${data.groom.name} ${data.bride.name} 사진 ${index + 1}`;
      image.loading = "lazy";
      image.onerror = () => figure.remove();
      figure.appendChild(image);
      gallery.appendChild(figure);
    });
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
})();
