import os, time, unittest, requests, random, string

BASE_URL      = os.getenv("BASE_URL", "http://localhost:3000")
EXAMS_URL     = os.getenv("EXAMS_URL", f"{BASE_URL}/api/exams")
QUESTIONS_URL = os.getenv("QUESTIONS_URL", f"{BASE_URL}/api/questions")

def rands(n=6):
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(n))

class TestExamsGET(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.subject = "matematica"
        time.sleep(float(os.getenv("TEST_BOOT_DELAY", "0.3")))

        
        cls.seed_qids = []
        for i in range(2):
            rq = requests.post(
                f"{QUESTIONS_URL}/{cls.subject}",
                json={
                    "name": f"[TEST] seed q{i} {rands()}",
                    "difficulty": "easy",
                    "statement": f"1+{i}?",
                    "options": {"A": "1", "B": "2", "answer": "B"},
                },
                timeout=10,
            )
            rq.raise_for_status()
            cls.seed_qids.append(rq.json()["saved"]["id"])

        
        re = requests.post(
            EXAMS_URL,
            json={
                "name": f"[TEST] Examen {rands()}",
                "description": "Examen semilla para GET",
                "subject": cls.subject,
                "questions": cls.seed_qids,
            },
            timeout=10,
        )
        re.raise_for_status()
        cls.exam_id = re.json()["examId"]

    @classmethod
    def tearDownClass(cls):
        
        try:
            requests.post(f"{BASE_URL}/api/_test/cleanup", timeout=5)
        except Exception:
            pass

    
    def test_get_questions_by_exam_ok(self):
        r = requests.get(f"{EXAMS_URL}/questions/{self.exam_id}", timeout=10)
        self.assertEqual(r.status_code, 200, r.text)
        questions = r.json()
        self.assertIsInstance(questions, list)
        self.assertGreaterEqual(len(questions), 2, f"Se esperaban >=2 preguntas, llegaron {len(questions)}")

    
    def test_get_questions_by_exam_not_found_should_be_404(self):
        fake_id = 99999999
        r = requests.get(f"{EXAMS_URL}/questions/{fake_id}", timeout=10)
        self.assertEqual(r.status_code, 404, f"Se esperaba 404, llegó {r.status_code}: {r.text}")

if __name__ == "__main__":
    unittest.main(verbosity=2)
