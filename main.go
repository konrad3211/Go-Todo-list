package main

import (
	//fmt → wypisywanie tekstu do konsoli.
	"fmt"
	"os"

	//log → logowanie błędów.
	"log"
	//fiber → framework HTTP podobny do Express.js z Node.js.
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

// to jest podobne do usestate w react, dynamicznie przechowujemy dane w ramie
type Todo struct {
	ID        int    `json:"id"`
	Completed bool   `json:"completed"`
	Body      string `json:"body"`
	//Nazwa obiektu, typ, nazwa pola
}

// To punkt startowy programu.
func main() {
	//pokazuje w konsoli hello world
	fmt.Println("Hello world")
	//Tworzy nowy serwer HTTP.
	app := fiber.New()

	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	//dzieki os mozemy odczytywac zmienne srodowiskowe
	PORT := os.Getenv("PORT")

	//Tworzysz pusty slice [liste].
	todos := []Todo{}

	//!Endpoint GET /
	//c zawiera i request, i response.
	app.Get("/api/todos", func(c *fiber.Ctx) error {
		//go zamienia map latwo na json
		return c.Status(200).JSON(todos)
	})

	//!Obsługuje wysłanie nowego Todo.
	app.Post("/api/todos", func(c *fiber.Ctx) error {

		//Tworzy pusty obiekt:
		// &Todo{
		// 	ID:0,
		// 	Completed:false,
		// 	Body:"",
		// }
		//todo to nazwa zmiennej
		todo := &Todo{}

		//od razu zakladamy ze moze byc error, probujemy zapisac req z body do todo za pomoca bodyparser
		if err := c.BodyParser(todo); err != nil {
			return err
		}

		//jezeli todo bedzie bez tekstu to wywal info
		if todo.Body == "" {
			return c.Status(400).JSON(fiber.Map{"error": "Todo body is required"})
		}
		//bez tego id zadania byloby 0, tego i kazdego innego, wiec uzywamy len czyli dlugosc i dodajemy jeden
		todo.ID = len(todos) + 1
		//dodajemy nowe todo do listy podobnie jak w react, kopia i dodanie nowego
		todos = append(todos, *todo)

		return c.Status(201).JSON(todo)
	})

	//!update a TODO
	app.Patch("/api/todos/:id", func(c *fiber.Ctx) error {
		//Pobierasz wartość parametru z adresu.
		//Zwróć uwagę, że Params() zawsze zwraca string.
		id := c.Params("id")

		//?to jest podobnie jak w map w react, czyli zapisujemy kazdy element w todos jako todo i szukamy tego co nas intersuje
		for i, todo := range todos {
			//fmt.Sprint() zamienia liczbę na tekst. bo todo.ID to int czyli liczba
			if fmt.Sprint(todo.ID) == id {
				//zmieniamy na true
				todos[i].Completed = true
				//i zwwracamy to todo
				return c.Status(200).JSON(todos[i])
			}
		}
		//jezeli bedzie blad to pokarze sie to
		return c.Status(404).JSON(fiber.Map{"error": "Todo not found"})
	})

	//!delete a TODO

	app.Delete("/api/todos/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")

		for i, todo := range todos {
			if fmt.Sprint(todo.ID) == id {
				//:i oznacza daj wszystko poza i, i+1 oznacza, daj wszystko co jest wieksze od i, nastepnie ..., ktore rozpakowuje to na pojedyncze elementy
				todos = append(todos[:i], todos[i+1:]...)
				return c.Status(200).JSON(fiber.Map{"success": true})
			}
		}
		return c.Status(404).JSON(fiber.Map{"error": "Todo not found"})
	})

	//uruchamiamy serwer i sluchamy na porcie 4000
	log.Fatal(app.Listen(":" + PORT))

}
