import os, time, unittest, requests, random

BASE_URL   = os.getenv("BASE_URL", "http://localhost:3000")
EXAMS_URL  = os.getenv("EXAMS_URL", f"{BASE_URL}/api/exams")

def random_question_ids(n=3):
    # Simula IDs válidos (deberías tener preguntas creadas en la DB con estos IDs)
    return [random.randint(1, 10) for _ in range(n)]

class TestExamsPOST(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.subject = "matematica"
        time.sleep(float(os.getenv("TEST_BOOT_DELAY", "0.2")))

    # Caso válido: examen completo
    def test_create_exam_ok(self):
        payload = {
            "name": "Examen de prueba",
            "description": "Evaluación básica",
            "subject": self.subject,
            "questions": random_question_ids()
        }
        r = requests.post(EXAMS_URL + "/", json=payload, timeout=10)
        self.assertEqual(r.status_code, 200, r.text)
        body = r.json()
        self.assertIn("examId", body)
        self.assertIn("Examen creado correctamente", body["message"])


    # Caso inválido: sin preguntas
    def test_create_exam_without_questions_should_be_400(self):
        payload = {
            "name": "Examen sin preguntas",
            "description": "No tiene preguntas",
            "subject": self.subject,
            "questions": []  # lista vacía
        }
        r = requests.post(EXAMS_URL + "/", json=payload, timeout=10)
        self.assertEqual(r.status_code, 400, f"Se esperaba 400, llegó {r.status_code}: {r.text}")
        self.assertIn("error", r.json())

if __name__ == "__main__":
    unittest.main(verbosity=2)
