<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Simple Web Contact Form</title>
        
        <!-- Bootstrap -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ENjdO4Dr2bkBIFxQpeoTz1HIcje39Wm4jDKdf19U8gI4ddQ3GYNS7NTKfAdVQSZe" crossorigin="anonymous"></script>

        <!-- Bootstrap Icons -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    </head>
    <body class="container">
        <div class="row row-cols-2 gx-4 mt-2">
            <form class="col" id="form" action="feed.php" method="post">
                <div class="row mb-3">
                    <div class="col">
                        <label for="rss">Insert a RSS Feed URL</label>
                        <input id="url-input" class="form-control" type="text" name="rss[]">
                        <div id="invalid-feedback"></div>
                    </div>
                    <div class="d-flex col-auto">
                        <button class="btn btn-secondary col-auto align-self-end" id="add-url-field">
                            <i class="bi bi-plus-lg"></i>
                        </button>
                    </div>
                </div>
                <div class="row-cols-2 gx-2">
                    <button class="btn btn-danger col-auto" id="reset">Reset</button>
                    <button class="btn btn-primary col-auto" type="submit">Submit</button>
                </div>
            </form>
            <section class="col" id="rss"></section>
        </div>
        <script>
            let count = 1

            document.getElementById("add-url-field").onclick = (e) => {
                e.preventDefault()

                let el = document.getElementById("url-input")

                let newEl = document.createElement("input")
                newEl.className = "form-control mt-2"
                newEl.type = "text"
                newEl.name = "rss[]"

                count++

                if(count > 3) {
                    let feedback = document.getElementById("invalid-feedback")
                    feedback.textContent = "Too much inputs! Send URLs or reset inputs."
                    feedback.classList.add("text-danger")

                    return false 
                }

                el.after(newEl)
            }

            document.getElementById("reset").onclick = (e) => {
                e.preventDefault()

                let el = document.getElementById("url-input")

                while (el.nextElementSibling) {
                    if(el.nextElementSibling.id === "invalid-feedback") {
                        el.nextElementSibling.textContent = ""
                        break
                    }

                    el.nextElementSibling.remove()                    
                }

                count = 1
            }

            // modificare il comportamento del form dopo l'invio
            form.onsubmit = async (e) => {
                e.preventDefault()
                let result

                let rss = document.getElementById("rss")
                rss.innerHTML = ""
                
                let response = await fetch("feed.php", {
                    method: "post",
                    body: new FormData(e.target),
                })

                try {
                    result = await response.json()
                } catch (error) {
                    let feedback = document.getElementById("invalid-feedback")
                    feedback.textContent = "Insert a valid RSS Feed URL."
                    feedback.classList.add("text-danger")

                    return false
                }
                    
                result.forEach(el => {
                    el.forEach(item => {
                        newsGenerator(item)
                    })
                })
            }

            let newsGenerator = (item) => {
                let card = document.createElement("div")
                let cardBody = document.createElement("div")
                let title = document.createElement("h3")
                let link = document.createElement("a")
                let pubdateEl = document.createElement("h6")

                let pubdate = new Date(item.pubdate).toLocaleDateString("it-IT")

                card.className = "card my-2"
                cardBody.classList.add("card-body")
                title.textContent = item.title
                link.href = item.link
                pubdateEl.textContent = pubdate === "Invalid Date" ? item.pubdate : pubdate
                
                rss.appendChild(card)
                card.appendChild(cardBody)
                cardBody.appendChild(link)
                cardBody.appendChild(pubdateEl)
                link.appendChild(title)
            }
        </script>
    </body>
</html>