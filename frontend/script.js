async function saveLetter(title, content) {

    try {

        const response = await fetch("/api/letters", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                content
            })
        });

        const data = await response.json();

        console.log(data);

    } catch (error) {

        console.error(error);
    }
}

async function loadLetters() {

    try {

        const response = await fetch("/api/letters");

        const letters = await response.json();

        console.log(letters);

        return letters;

    } catch (error) {

        console.error(error);
    }
}

