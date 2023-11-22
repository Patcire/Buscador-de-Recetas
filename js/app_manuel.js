// API => www.themealdb.com

function iniciarApp() {

    // selectores
    const selectCategorias = document.querySelector("#categorias")

    if (selectCategorias) {
        selectCategorias.addEventListener("change", obtenerRecetas)
        obtenerCategorias()
    }

    const favoritosDiv = document.querySelector(".favoritos")

    if (favoritosDiv) {
        obtenerFavoritos()
    }

    // Instacionamos el modal boostrap
    const modal = new bootstrap.Modal("#modal", {})

    // Inicia la aplicación
    function obtenerCategorias() {
        url = "https://www.themealdb.com/api/json/v1/1/categories.php"
        fetch(url)
            .then((res) => res.json())
            .then((data) => mostrarCategorias(data.categories))
    }

    // Muestra categorias
    function mostrarCategorias(categorias) {
        categorias.forEach(categoria => {
            const option = document.createElement("OPTION")

            option.value = categoria.strCategory
            option.textContent = categoria.strCategory

            selectCategorias.appendChild(option)
        });
    }

    // Obtiene las recetas de una categoria
    function obtenerRecetas(e) {
        const categoria = e.target.value
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
        fetch(url)
            .then((res) => res.json())
            .then((data) => mostrarRecetas(data.meals))
    }

    // Muestra las recetas
    function mostrarRecetas(recetas = []) {

        limpiarHTML(resultado)

        recetas.forEach((receta) => {
            const {idMeal, strMeal, strMealThumb} = receta

            // Contenedor para las recetas
            const contenedorRecetas = document.createElement("DIV")

            contenedorRecetas.classList.add("col-md-4")

            // Construimos el card de recetas
            const recetaCard = document.createElement("DIV")
            recetaCard.classList.add("card", "mb-4")

            // Creamos la imagen
            const recetaImagen = document.createElement("IMG")
            recetaImagen.classList.add("card-img-top")
            recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.img}`
            recetaImagen.src = strMealThumb ?? receta.img

            // Body del card
            const recetaCardBody = document.createElement("DIV")
            recetaCardBody.classList.add("card-body")

            // Titulo
            const recetaHeading = document.createElement("H3")
            recetaHeading.classList.add("card-title", "mb-3")
            recetaHeading.textContent = strMeal ?? receta.title

            // Boton
            const recetaButton = document.createElement("BUTTON")
            recetaButton.classList.add("btn", "btn-danger", "w-100")
            recetaButton.textContent = "Ver Receta"

            // Añadimos un evento al botón
            recetaButton.onclick = function () {
                seleccionarReceta(idMeal ?? receta.id)
            }

            recetaCardBody.appendChild(recetaHeading)
            recetaCardBody.appendChild(recetaButton)

            recetaCard.appendChild(recetaImagen)
            recetaCard.appendChild(recetaCardBody)

            contenedorRecetas.appendChild(recetaCard)

            resultado.appendChild(contenedorRecetas)
        })
    }

    // Limpiar el HTML
    function limpiarHTML(selector) {
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild)
        }

    }

    // Seleccionar Receta
    function seleccionarReceta(id) {
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then((res) => res.json())
            .then((data) => mostrarRecetaModal(data.meals[0]))
    }

    // Mostrar la receta en el modal
    function mostrarRecetaModal(receta) {
        console.log(receta)
        const {idMeal, strInstructions, strMeal, strMealThumb} = receta

        const modalTitle = document.querySelector(".modal .modal-title")
        const modalBody = document.querySelector(".modal .modal-body")

        modalTitle.textContent = strMeal

        modalBody.innerHTML = `
      <img class="img-fluid" src=${strMealThumb} alt=${strMeal}>
      <h3 class="my-3">Instrucciones</h3>
      <p>${strInstructions}</p>`

        const listGroup = document.createElement("UL")
        listGroup.classList.add("list-group")

        // Mostramos ingredientes
        for (let i = 1; i <= 20; i++) {
            if (receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`]
                const cantidad = receta[`strMeasure${i}`]

                // console.log(`strIngredient${i} - strMeasure${i} `)
                const ingredientLi = document.createElement("LI")
                ingredientLi.classList.add("list-group-item")
                ingredientLi.textContent = `${cantidad} - ${ingrediente}`

                listGroup.appendChild(ingredientLi)
            }
        }

        modalBody.appendChild(listGroup)

        // Mostramos los botones

        const modalFooter = document.querySelector(".modal-footer")

        // Limpiamos el footer antes de imprimir los botones
        limpiarHTML(modalFooter)

        const btnFavorito = document.createElement("BUTTON")

        existeFavorito(idMeal)
            ? btnFavorito.classList.add("btn", "btn-warning", "col")
            : btnFavorito.classList.add("btn", "btn-danger", "col")

        btnFavorito.textContent = existeFavorito(idMeal)
            ? "Eliminar Favorito"
            : "Guardar Favorito"


        modalFooter.appendChild(btnFavorito)

        btnFavorito.onclick = function () {
            if (existeFavorito(idMeal)) {
                eliminarFavorito(idMeal)

                btnFavorito.textContent = "Guardar Favorito"
                btnFavorito.classList.add("btn-danger")
                btnFavorito.classList.remove("btn-warning")

                mostrarToast("Receta eliminada correctamente")
                return
            }

            agregarFavorito({
                id: idMeal,
                title: strMeal,
                img: strMealThumb
            })
            btnFavorito.textContent = "Borrar Favorito"
            btnFavorito.classList.add("btn-warning")
            btnFavorito.classList.remove("btn-danger")

            mostrarToast("Receta añadida correctamente")


        }


        // Botón cerrar
        const btnCerrar = document.createElement("BUTTON")
        btnCerrar.classList.add("btn", "btn-secondary", "col")
        btnCerrar.textContent = "cerrar"
        modalFooter.appendChild(btnCerrar)
        btnCerrar.onclick = function () {
            modal.hide()
        }
        modal.show()
    }

    // Añade a favoritos
    function agregarFavorito(receta) {
        console.log(receta)
        // Operador nullish coalescing..
        const favorito = JSON.parse(localStorage.getItem("recetasFavoritos")) ?? []
        localStorage.setItem("recetasFavoritos", JSON.stringify([...favorito, receta]))
    }

    // Comprueba si la receta ya está en favoritos (Ls)
    function existeFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem("recetasFavoritos")) ?? []
        return favoritos.some((favorito) => favorito.id === id)
    }

    // Elimina una recera de favoritos (LS)
    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem("recetasFavoritos")) ?? []
        const nuevosFavoritos = favoritos.filter((favorito) => favorito.id !== id)
        localStorage.setItem("recetasFavoritos", JSON.stringify(nuevosFavoritos))

    }

    // Funcion que muesta el toast
    function mostrarToast(mensaje) {
        const toastDiv = document.querySelector("#toast")
        const toastDivBody = document.querySelector(".toast-body")
        const toast = new bootstrap.Toast(toastDiv)
        toastDivBody.textContent = mensaje
        toast.show()
    }

    // Funcion que muestra los favoritos
    function obtenerFavoritos() {
        const favoritos = JSON.parse(localStorage.getItem("recetasFavoritos")) ?? []
        if (favoritos.length) {
            mostrarRecetas(favoritos)
            return
        }
        const noFavoritos = document.createElement("P")
        noFavoritos.textContent = "No hay favoritos"
        noFavoritos.classList.add("fs-4", "text-center", "font-bold", "mt-5")
        favoritosDiv.appendChild(noFavoritos)

    }
}

document.addEventListener("DOMContentLoaded", iniciarApp)
