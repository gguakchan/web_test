import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
from torchvision import datasets, models, transforms
from PIL import Image
import os

import pymongo
from pymongo import MongoClient

model = torch.load('model.pt')

transforms_test = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu") # device 객체

class_names =('hela', 'ht', 'imr')

def getValue():
    folder_path = "./files"

    file_list = os.listdir(folder_path)

    if len(file_list) == 1:
        old_filename = file_list[0]
        new_filename = "1"

        old_file_path = os.path.join(folder_path, old_filename)
        new_file_path = os.path.join(folder_path, new_filename)

        os.rename(old_file_path, new_file_path)

    image = Image.open('./files/1')
    image = transforms_test(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
        _, preds = torch.max(outputs, 1)
        print('result: ' + class_names[preds[0]])
    
        cluster = MongoClient("mongodb+srv://wonomedb:wonomedb123@wonome.3buk7.mongodb.net/")

        db = cluster["cell_classification"]
        collection = db["classification"]

        respond = class_names[preds[0]]
        post = {"result": respond}
        collection.insert_one(post)
    
    dir = './files'
    for f in os.listdir(dir):
        os.remove(os.path.join(dir, f))

if __name__ == '__main__':
    getValue()
