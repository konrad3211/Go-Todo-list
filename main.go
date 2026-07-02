package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"

	// 	mongo → zawiera funkcje do pracy z MongoDB (Connect(), Collection(), Database() itd.).
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	// options → zawiera konfigurację dla tych funkcji.
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Todo struct {
	//dajemy to bson poniewaz mongo zapisuje swoje dane w bson. binary json
	//dodajemy to omitempty bo bez tego id byloby 00000, a z tym bedzie unikalne z mongo.
	//Dzieje sie tak dlatego ze omitempty mowi, ze jezeli ta wartosc jest zerowa to pomin te pole, wiec wysylamy do mongo obiket bez id, wiec mongo samo dodaje sobie to id.
	//tutaj sa dwa tagi json i bson. json jest dla reacta, bson jest dla mongo. App wie, ze ma czytac json, mongo czytaj bson, tutaj nie ma problemu, bilbioteki wiedza co maja czytac.
	ID        primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Completed bool               `json:"completed"`
	Body      string             `json:"body"`
	//Nazwa obiektu, typ, nazwa pola
}

// *adres w pamięci, pod którym znajduje się obiekt kolekcji
var collection *mongo.Collection

func main() {

	if os.Getenv("ENV") != "production" {
		err := godotenv.Load(".env")
		if err != nil {
			log.Fatal("Error loading .env file", err)
		}
	}

	MONGODB_URI := os.Getenv("MONGODB_URI")
	//tutaj tworzymy obiekt do polaczenia sie z mongo.
	clientOptions := options.Client().ApplyURI(MONGODB_URI)

	//tutaj tworzymy polaczenie z mongodb, context.background() jest domyslnym kontekstem, mongo tego wymaga, options to konfiguracja. To nic nie robi nie ma znaczenia, ale musi byc. Mozna w przyszlosci to zmienic, ze np. bedzie timer do polaczenia, jezeli sie bedzie dlugo laczyc z mongo to wtedy sie rozlaczy.
	//? context to obiekt, który przekazuje informacje o tym, jak ma być wykonana dana operacja
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	//? tutaj po control + c program rozlaczy sie z mongodb, czyli gdy wylaczymy serwer. Teoretycznie mongo samo sie z siebie rozlaczy, ale to dobra praktyka.
	defer client.Disconnect(context.Background())

	//Ping to metoda typu mongo.Client, ktora sprawdza czy jest mozliwe polaczenie z mongo.
	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println("Connected to MONGODB")

	//! tutaj trzeba zaznaczyc, ze golang_db to nazwa bazy danych, ktora nadalem w .env po .net/
	collection = client.Database("golang_db").Collection("todos")

	//startujemy serwer, cos jak express
	app := fiber.New()

	// app.Use(cors.New(cors.Config{
	// 	AllowOrigins: "http://localhost:5173",
	// 	AllowHeaders: "Origin,Content-Type,Accept",
	// }))

	app.Get("/api/todos", getTodos)
	app.Get("/api/todos/:id", getTodo)
	app.Post("/api/todos", createTodo)
	app.Patch("/api/todos/:id", updateTodo)
	app.Delete("/api/todos/:id", deleteTodo)

	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	if os.Getenv(("ENV")) == "production" {
		app.Static("/", "./client/dist")
	}

	//jak wystapi blad to log.Fatal zatrzymuje program i wyswietla komunikat
	log.Fatal(app.Listen("0.0.0.0:" + port))
}

func getTodos(c *fiber.Ctx) error {
	var todos []Todo

	//pusty context, bson.M = to filtr, nie wpisujemy w nim nic, czyli chcemy wszystko
	cursor, err := collection.Find(context.Background(), bson.M{})

	if err != nil {
		return err
	}

	//! to zamyka cursor po wykonaniu funkcji
	//? musi to byc w tym miejscu, go zapamietuje, ze jak kod sie wykona to go zamyka. Jakby byl na samym dole, a err sie pojawi gdzies w srodku to nie dojdzie do zamkniecia. wiec sprawdzamy czy jest tutaj err jak nie ma to przechodzimy do tej linijki.
	defer cursor.Close(context.Background())

	//Next ->"Przejdź do następnego dokumentu. Jeżeli istnieje, zwróć true." Jezeli juz nie ma dokumentow to zwraca false
	for cursor.Next(context.Background()) {
		//tworze pusta stukture Todo o nazwie "todo"
		var todo Todo
		//dekodujemy dokument z mongo do naszej struktury i wypelniamy zmienna todo tym dokumentem
		if err := cursor.Decode(&todo); err != nil {
			return err
		}

		//dodajemy do tablicy todo, podbnie jak w react najpierw kopia tablicy i potem dodajemy element
		todos = append(todos, todo)
	}
	return c.JSON(todos)
}

func getTodo(c *fiber.Ctx) error {
	id := c.Params("id")
	objectID, err := primitive.ObjectIDFromHex(id)

	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid todo ID"})
	}

	filter := bson.M{"_id": objectID}

	var todo Todo

	err = collection.FindOne(context.Background(), filter).Decode(&todo)

	if err != nil {
		c.Status(404).JSON(fiber.Map{"error": "Todo not found"})
	}

	return c.JSON(todo)

}

func createTodo(c *fiber.Ctx) error {
	//to jest skrot od todo := &Todo{}, Oba zapisy robią to samo.
	todo := new(Todo)

	//bodyparser Odczytuje body requestu HTTP i wpisuje dane do struktury todo.
	if err := c.BodyParser(todo); err != nil {
		return err
	}

	if todo.Body == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Todo body is required"})
	}

	//tutaj tworzymy nowy dokument w mongo
	insertResult, err := collection.InsertOne(context.Background(), todo)
	if err != nil {
		return err
	}
	//mongo powyzej w insertResult zwraca err i insertedID (miedzyinnymi), a my to id przypisujemy do todo, nalezy pamitac, ze to zapis jedynie w pamieci programu, mongo juz zapisalo id w dbs
	todo.ID = insertResult.InsertedID.(primitive.ObjectID)

	return c.Status(201).JSON(todo)
}

func updateTodo(c *fiber.Ctx) error {
	//Pobierasz parametr z URL. np /api/todos/6862b5c54d20cf6b18dbf471 - to jest string
	id := c.Params("id")

	//mongo nie uzywa id jako string, tylko primitive object, dlatego tutaj to zamieniamy
	//mongo zapisuje id jako ObjectID w hex czyli teskt zapisany szesnastkowo, wiec tutaj tworzymy doslownie z naszego id z url objectID z mongo
	objectID, err := primitive.ObjectIDFromHex(id)

	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid todo ID"})
	}

	//tutaj filtrujemy, ze chcemy obiekt o konkretnym id
	filter := bson.M{"_id": objectID}
	//mowimy co ma zmienic w tym obiekcie
	update := bson.M{"$set": bson.M{"completed": true}}

	//tutaj jest _ bo nie potrzebujemy callback z updateOne chcemy tylko err, jakbysmy chcieli pozniej w json zwrocic caly poprawiony obiekt to musielibysmy zmienic metoda na findOneAndUpdate
	_, err = collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		return err
	}
	return c.Status(200).JSON(fiber.Map{"success": true})
}

func deleteTodo(c *fiber.Ctx) error {
	id := c.Params("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid todo ID"})

	}

	filter := bson.M{"_id": objectID}
	_, err = collection.DeleteOne(context.Background(), filter)
	if err != nil {
		return err
	}
	return c.Status(200).JSON(fiber.Map{"success": true})

}
