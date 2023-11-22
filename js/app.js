// www.themealdb.com/api/json/v1/1/categories.php

const iniciar_app = () => {
// Selectores
    const categorias_desplegable = document.querySelector('.form-select')
    const resultado = document.querySelector('#resultado')
    const favoritos_div = document.querySelector('.favoritos')
    const modal = new bootstrap.Modal(`#modal`, {})
// Funciones

    const obtener_categorias = () => {
        const url = "https://www.themealdb.com/api/json/v1/1/categories.php"
        fetch(url)
            .then((respuesta) => respuesta.json())
            .then((data) => mostrar_categorias(data.categories))
    }

    const mostrar_categorias = (categorias) => {
        categorias.forEach(categoria => {
            const option = document.createElement('option')
            option.value = categoria.strCategory
            option.textContent = categoria.strCategory
            categorias_desplegable.appendChild(option)
        })
    }

    const obtener_recetas = (e) => {
        e.preventDefault()
        const categoria = e.target.value
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
        fetch(url)
            .then((respuesta) => respuesta.json())
            .then((data) => mostrar_recetas(data.meals))
    }

    const limpiar_html = (selector) => {
        while (selector.firstElementChild) {
            selector.firstElementChild.remove()
        }
    }

    const mostrar_recetas = (recetas = []) => {
        limpiar_html(resultado)
        recetas.forEach(receta => {
            const {idMeal, strMeal, strMealThumb} = receta
            console.log(strMeal)
            const contenedor_recetas = document.createElement('div')
            contenedor_recetas.classList.add('col-md-4')
            const card_receta = document.createElement('div')
            card_receta.classList.add('card', 'mb-4')

            // Imagen
            const imagen_receta = document.createElement('img')
            imagen_receta.classList.add('card-img-top')
            imagen_receta.alt = `Imagen de la receta ${strMeal ?? receta.img}`
            imagen_receta.src = strMealThumb ?? receta.img

            // Body del card
            const body_card_receta = document.createElement('div')
            body_card_receta.classList.add('card-body')

            const heading_receta = document.createElement('h3')
            heading_receta.classList.add('card-title', 'mb-3')
            heading_receta.textContent = strMeal ?? receta.title

            //boton
            const boton_ver_receta = document.createElement('button')
            boton_ver_receta.classList.add('btn', 'btn-danger', 'w-100')
            boton_ver_receta.textContent = 'Ver receta'

            boton_ver_receta.addEventListener('click', (e) => {
                e.preventDefault()
                console.log('click')
                seleccionar_receta(idMeal ?? receta.id)
                mostrar_receta_modal(receta)
            })

            body_card_receta.appendChild(heading_receta)
            body_card_receta.appendChild(imagen_receta)
            body_card_receta.appendChild(boton_ver_receta)
            card_receta.appendChild(body_card_receta)
            contenedor_recetas.appendChild(body_card_receta)
            resultado.appendChild(contenedor_recetas)

        })

    }

    const mostrar_receta_modal = (receta) => {

        const {idMeal, strInstructions, strMeal, strMealThumb} = receta

        const titulo_modal = document.querySelector('.modal .modal-title')
        const body_modal = document.querySelector('.modal .modal-body')

        titulo_modal.textContent = strMeal

        body_modal.innerHTML = `
        <img class = 'img-fluid' src=${strMealThumb} alt=${strMeal}>
        <h3 class="my-3">Instrucciones</h3>
        <p>${strInstructions}</p>
    `

        const list_group = document.createElement('ul')
        list_group.classList.add('list-group')

        for (let i = 1; i <= 20; i++) {
            if (receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`]
                const cantidad = receta[`strMeasure${i}`]

                const li_ingrediente = document.createElement('li')
                li_ingrediente.classList.add("list-group-item")
                li_ingrediente.textContent = `${ingrediente} - ${cantidad}`
                list_group.appendChild(li_ingrediente)
            }
        }

        body_modal.appendChild(list_group)

        // Para mostrar los botones
        const footer_modal = document.querySelector(".modal-footer")
        // limpiamos el footer antes de mostrar
        limpiar_html(footer_modal)

        const boton_favorito = document.createElement("button")

        footer_modal.appendChild(boton_favorito)

        existe_favorito(idMeal)
            ? boton_favorito.classList.add('btn', 'btn-warning', 'col')
            : boton_favorito.classList.add('btn', 'btn-danger', 'col')
        boton_favorito.textContent = "Guardar Favorito"

        boton_favorito.textContent = existe_favorito(idMeal)
            ? "Eliminar Favorito"
            : "Guardar Favorito"

        boton_favorito.addEventListener('click', () => {
            if (existe_favorito(idMeal)) {
                eliminar_favoritos(idMeal)
                boton_favorito.textContent = "Guardar Favorito"
                boton_favorito.classList.add("btn-danger")
                boton_favorito.classList.remove("btn-warning")
                mostrar_toast('Receta eliminada correctamente')
                return
            }

            agregar_favorito({
                id: idMeal,
                title: strMeal,
                img: strMealThumb
            })
            boton_favorito.textContent = "Borrar Favorito"
            boton_favorito.classList.add("btn-warning")
            boton_favorito.classList.remove("btn-danger")

            mostrar_toast('Receta añadida correctamente')

        })


        const boton_cerrar = document.createElement("BUTTON")
        boton_cerrar.classList.add("btn", "btn-secondary", "col")
        boton_cerrar.textContent = "cerrar"
        footer_modal.appendChild(boton_cerrar)
        boton_cerrar.addEventListener('click', () => {
            modal.hide()
        })

        modal.show()
    }

    const agregar_favorito = (receta) => {
        eliminar_favoritos(receta)
        const favorito = JSON.parse(localStorage.getItem('recetas_favoritos')) ?? []
        localStorage.setItem("recetas_favoritos", JSON.stringify([...favorito, receta]))
    }

    const seleccionar_receta = (id) => {
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then((res) => res.json())
            .then((data) => mostrar_receta_modal(data.meals[0]))
    }

    const existe_favorito = (id) => {

        const favoritos = JSON.parse(localStorage.getItem("recetas_favoritos")) ?? []
        return favoritos.some((favorito) => favorito.id === id)
    }

    const eliminar_favoritos = (id) => {
        const favoritos = JSON.parse(localStorage.getItem("recetas_favoritos")) ?? []
        const nuevos_favoritos = favoritos.filter((favorito) => favorito.id !== id)
        localStorage.setItem('recetas_favoritos', JSON.stringify(nuevos_favoritos))
    }


    const mostrar_toast = (mensaje) => {
        const toast_div = document.querySelector('#toast')
        const toast_div_body = document.querySelector('.toast-body')
        const toast = new bootstrap.Toast(toast_div)
        toast_div_body.textContent = mensaje
        toast.show()
    }

    const obtener_favoritos = () => {
        const favoritos = JSON.parse(localStorage.getItem('recetas_favoritos')) ?? []
        if (favoritos.length) {
            mostrar_recetas(favoritos)
            return
        }
        const no_favoritos = document.createElement('p')
        no_favoritos.textContent = 'No hay favoritos'
        no_favoritos.classList.add('fs-4', 'text-center', 'font-bold')
        favoritos_div.appendChild(no_favoritos)
    }


    if (favoritos_div) { //too do esto metelro en una función iniciar_app
        console.log('tamos en favs')
        obtener_favoritos()
    } else {
        categorias_desplegable.addEventListener('change', obtener_recetas)
        obtener_categorias()
    }
}
document.addEventListener('DOMContentLoaded', (e) => {
    e.preventDefault()
    iniciar_app()
})

