import os, time, unittest, requests, random, string

BASE_URL      = os.getenv("BASE_URL", "http://localhost:3000")
QUESTIONS_URL = os.getenv("QUESTIONS_URL", f"{BASE_URL}/api/questions")

def rands(n=6):
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(n))

class TestQuestionsPOST(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.subject = "matematica"
        time.sleep(float(os.getenv("TEST_BOOT_DELAY", "0.2")))

    @classmethod
    def tearDownClass(cls):
        # Si tuvieras un DELETE para limpiar, podrías llamarlo aquí.
        pass

    # Caso 1 (equivalencia válida): payload completo -> 200
    def test_questions_create_ok(self):
        payload = {
            "name": f"Pregunta {rands()}",
            "difficulty": "easy",
            "statement": "2+3?",
            "options": {"A":"4","B":"5","C":"6","answer":"B"}
        }
        r = requests.post(f"{QUESTIONS_URL}/{self.subject}", json=payload, timeout=10)
        self.assertEqual(r.status_code, 200, r.text)
        body = r.json()
        self.assertIn("saved", body)
        for k in ("id", "name", "difficulty", "statement", "options", "subject"):
            self.assertIn(k, body["saved"])

    # Caso 2 (inválido semántico): falta options.answer -> esperamos 422 (FALLARÁ hoy)
    def test_questions_create_without_answer_422(self):
        payload = {
            "name": f"Pregunta sin answer {rands()}",
            "difficulty": "medium",
            "statement": "elige la correcta",
            "options": {"A":"x","B":"y"}  # sin 'answer'
        }
        r = requests.post(f"{QUESTIONS_URL}/{self.subject}", json=payload, timeout=10)
        # Forzamos FAIL hasta que endurezcas el backend:
        self.assertEqual(r.status_code, 422, f"Se esperaba 422, llegó {r.status_code}: {r.text}")

if __name__ == "__main__":
    unittest.main(verbosity=2)
