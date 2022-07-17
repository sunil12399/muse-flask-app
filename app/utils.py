import json
import tensorflow as tf
import re

__model = None
__data_columns = None

### Prediction of a generated song ###

def generate_text(model, start_string, generation_length=500):
    # Evaluation step (generating ABC text using the learned RNN model)

    input_eval = [__char2idx.get(s, 1) for s in start_string] # TODO
    temp = list(set(input_eval))
    try:
        temp.remove(1)
        alnumcount = sum([s.isalnum() for s in start_string])
        if len(temp)<2 or alnumcount<2:
            raise Exception('Text written was not useful')
    except ValueError:
        pass
    finally:
        alnumcount = sum([s.isalnum() for s in start_string])
        if len(temp)<2 or alnumcount<2:
            raise Exception('Text written was not useful')
    
    input_eval = tf.expand_dims(input_eval, 0)

    # Empty string to store our results
    text_generated = []

    # Here batch size == 1
    model.reset_states()
    for i in range(generation_length):
        predictions = model(input_eval)

        # Remove the batch dimension
        predictions = tf.squeeze(predictions, 0)

        predicted_id = tf.random.categorical(predictions, num_samples=1)[-1,0].numpy()

        # Pass the prediction along with the previous hidden state
        #   as the next inputs to the model
        input_eval = tf.expand_dims([predicted_id], 0)

        text_generated.append(__idx2char[predicted_id])
    return (start_string + ''.join(text_generated))

def extract_song_snippet(text):
    try:
        pattern = r'(?=(^|\n\n)(.*?)\n\n)'
        search_results = re.findall(pattern, text, flags=re.DOTALL)
        songs = [song[1] for song in search_results]
        print("Found {} songs in text".format(len(songs)))
    except:
        print('Song cannot be extracted.')
    return songs

def extract(string2):
    generated_text1 = generate_text(__model, start_string=string2, generation_length=500)
    generated_songs = extract_song_snippet(generated_text1)
    return generated_songs


def load_saved_artifacts():
    print("Loading Saved Artifacts...")
    global __model
    global __data_columns
    global __char2idx
    global __idx2char
    with open(r"app/char2idx.json", "r") as f:
        __char2idx = json.load(f)
    with open(r"app/idx2char.json", "r") as f:
        __idx2char = json.load(f)
    __model = tf.keras.models.load_model(r'app/saved_model/my_model')
    print('model build')

if __name__=="__main__":
    load_saved_artifacts()
    # load_saved_artifacts()
    print("Load successfully")