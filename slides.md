---
# You can also start simply with 'default'
theme: seriph
background: "public/images/cover.webp"
# some information about your slides (markdown enabled)
title: "PianoGen: Generacion de Musica de Piano con IA"
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# apply unocss classes to the current slide
class: text-center
# https://sli.dev/features/drawing
drawings:
  persist: false
# slide transition: https://sli.dev/guide/animations.html#slide-transitions
transition: slide-left
mdc: true
setup:
  import MidiPlayer from 'components/MidiPlayer.vue'
  import 'setup/main.js'
---


<!-- Your slide content

<!-- <MidiPlayer midi-path="saved_outputs/v2/v2-best.mid" /> -->
<!-- <MidiPlayer midi-path="saved_outputs/v3/v3-try3-more-training.mid" /> -->

<!-- # Hi -->

<!-- For half size -->
<!-- <MidiPlayer midi-path="your-midi-file.mid" height="35vh" /> -->
<!-- --- -->
<!-- --- -->


# PianoGen: Generacion de Musica de Piano con IA
Aplicando Transformers.

<div class="abs-br m-6 text-xl">
  <a href="https://github.com/MightyHelper/pianogen" target="_blank" class="slidev-icon-btn">
    <carbon:logo-github />
  </a>
</div>


<!--
The last comment block of each slide will be treated as slide notes. It will be visible and editable in Presenter Mode along with the slide. [Read more in the docs](https://sli.dev/guide/syntax.html#notes)
-->

---
---
<Toc maxDepth=1 />
<!-- TODO: Split image layout -->

---
---

# Qué es una canción?

<!-- TODO: piano roll image -->

---
transition: fade-out
title: "Resumen: MIDI"
---

# Resumen: MIDI

<v-clicks>

- 🎵 **Mensajes de Nota** – Eventos de nota-on/off, tono, velocidad, duración.  
- 🎚️ **Mensajes de Control Change (CC)** – Ajusta volumen, modulación, expresión.  
- 🎛️ **Cambio de Programa** – Cambia sonidos o patches de instrumento.  
- ⏳ **Tiempo & Sincronización** – Tempo, firmas de tiempo, sincronización.  
- 🔧 **Mensajes de Sistema** – Metadatos, posición de la canción, datos SysEx.  

</v-clicks>

<!-- <center> -->

![](/images/midi-notes.jpg){width=65%}

<!-- </center> -->

---
---
# Datasets
<v-clicks>

- Custom
- Maestro
- JSB
- Lakh?

</v-clicks>

---
---
## Ejemplo Maestro

<MidiPlayer midi-path="saved_outputs/maestro_samples/MIDI-Unprocessed_R1_D1-1-8_mid--AUDIO-from_mp3_01_R1_2015_wav--5.midi" />

---
---
## Ejemplo custom

<MidiPlayer midi-path="saved_outputs/custom_samples/midi_undefined_1715486929603.mid" />
---
---

## Ejemplo JSB

<MidiPlayer midi-path="saved_outputs/jsb_samples/000000.mid" />
---
---

## Comparación de tamaño de datasets

<!-- <center> -->

![](/images/note-count.png){border=rounded}

<!-- </center> -->

---
---
## Comparación de uso de notas

<!-- <center> -->

![](/images/pitch-distribution.png){width=85%, border=rounded}

<!-- </center> -->

---
---
## Comparación de duración de notas

<!-- <center> -->

![](/images/duration-per-dataset.png){border=rounded}

<!-- </center> -->

---
title: Tokenización
---
# Tokenización
Cómo tokenizamos musica?
<!-- TODO: Image piano roll + Arrow + token ids + question mark -->

<v-clicks depth=2>

- MidiTok (REMI) 
  - ![](https://miditok.readthedocs.io/en/latest/_images/remi.png)
- CrayKH (Texto)
  - ![](/images/craykh-tokenization.png)

</v-clicks>

---
---
# Tokenización
<v-clicks depth=2>

- JSB
  - ![](/images/jsb-tokenization.png)
- Tokenización continua?

</v-clicks>

---
title: TransformerModel Architecture
layout: two-cols-header

---

# Primeros experimentos
<!-- TODO: Explain TFModel and it's shortcomings -->
<!-- Explain that training did not give good results. No need to listen - show empty piano roll -->
::left::

<Transform :scale=0.4>

```mermaid

graph TD;
    A[Input Tokens] -->|Token Embedding| B[Token Embeddings];
    A2[Position Index] -->|Position Embedding| B2[Position Embeddings];
    B -->|Summation| C[Embedded Input];
    B2 -->|Summation| C;
    
    C -->|Pass Through| D[Transformer Encoder];
    D -->|Multiple Layers| D1[Self-Attention];
    D1 -->|Feed Forward Network| D2[FFN];
    D2 -->|Final Encoding| E[Encoded Representation];
    
    E -->|Linear Layer| F[Output Layer];
    F -->|Logits| G[Predicted Tokens];
```

</Transform>


::right::

<v-clicks>

- Tokenizador: `REMI`
- Arquitectura transformer básica
- Encoder-only
- ```yaml
  vocab_size: 3000
  embed_size: 512
  num_heads: 8
  num_layers: 6
  ff_hidden_size: 2048
  max_seq_length: 512
  dropout: 0.1
  ```
- No tuvo muy buenos resultados
- Complejidad del tokenizador?

</v-clicks>

---
---

# V2

<v-clicks>

<!-- Explain the ehnanced tokenization. Why BPE is not good. -->
<!-- Show result after 30 minutes of training -->
<!-- saved_outputs/v2/v2-best.mid -->

- Mismo modelo que V1
- Tokenizador sin BPE
- Resultados con 30 minutos de entrenamiento; loss = 0.01
- <MidiPlayer midi-path="saved_outputs/v2/v2-best.mid" height=35vh />

</v-clicks>

---
---
# V3

<!-- Explain why experiment with GPT-2 -->
<!-- Talk about HF Trainer API -->
<!-- Talk about overfitting and dataset contamination -->

<v-clicks>

- Modelo GPT-2
- Loop de entrenamiento con HF Trainer API
- Pre-Chunking para batching
- Overfitting y contaminación del dataset!
</v-clicks>
<v-switch unmount=true>
  <template #1 > <MidiPlayer midi-path="saved_outputs/v3/v3-try-1.mid" height=30vh /> </template>
  <template #2 > <MidiPlayer midi-path="saved_outputs/v3/v3-try-2-more-train.mid" height=30vh /> </template>
  <template #3 > <MidiPlayer midi-path="saved_outputs/v3/v3-try3-more-training.mid" height=30vh /> </template>
</v-switch>
---
---

# V4
<!-- Experimented with different datasets, multiple training resumes from checkpoints -->

<!-- Show some of the results -->

- Denuevo con GPT-2
- Experimentando con diferentes datasets
- Resumiendo muchas veces de un checkpoint anterior
- Explorando augmentacion $\leftarrow$ Mas contaminación!
<v-switch unmount=true>
  <template #1 > <MidiPlayer midi-path="saved_outputs/v4/01-lahk/v4-lakh.mid" height=30vh /> </template>
  <template #2 > <MidiPlayer midi-path="saved_outputs/v4/02-manual/v4-1-manual.mid" height=30vh /> </template>
  <template #3 > <MidiPlayer midi-path="saved_outputs/v4/02-manual/v4-1-manual-1.mid" height=30vh /> </template>
  <template #4 > <MidiPlayer midi-path="saved_outputs/v4/02-manual/v4-1-manual-2.mid" height=30vh /> </template>
  <template #5 > <MidiPlayer midi-path="saved_outputs/v4/02-manual/v4-1-manual-3.mid" height=30vh /> </template>
  <template #6 > <MidiPlayer midi-path="saved_outputs/v4/02-manual/v4-1-manual-b-1.mid" height=30vh /> </template>
  <template #7 > <MidiPlayer midi-path="saved_outputs/v4/02-manual/v4-1-manual-b-2.mid" height=30vh /> </template>
  <template #8 > <MidiPlayer midi-path="saved_outputs/v4/02-manual/v4-1-manual-b-3.mid" height=30vh /> </template>
  <template #9 > <MidiPlayer midi-path="saved_outputs/v4/02-manual/v4-1-manual-b-4.mid" height=30vh /> </template>
  <template #10 > <MidiPlayer midi-path="saved_outputs/v4/03-larger/1-of-1.mid" height=30vh /> </template>
  <template #11 > <MidiPlayer midi-path="saved_outputs/v4/03-larger/1-of-2.mid" height=30vh /> </template>
  <template #12 > <MidiPlayer midi-path="saved_outputs/v4/03-larger/1-of-3.mid" height=30vh /> </template>
  <template #13 > <MidiPlayer midi-path="saved_outputs/v4/03-larger/1-of-4.mid" height=30vh /> </template>
  <template #14 > <MidiPlayer midi-path="saved_outputs/v4/03-larger/1-of-5.mid" height=30vh /> </template>
  <template #15 > <MidiPlayer midi-path="saved_outputs/v4/04-slow-train/generated.mid" height=30vh /> </template>
</v-switch>

---
---

# Problemas de la Tokenizacion `REMI`
<v-clicks>

- Token Embedding + Positional? Embedding
- Duración?
- Volumen?
- Orden de notas en un acorde?

</v-clicks>

---
---
# V5

Tomamos los eventos de midi y los traducimos al siguiente formato:
```yaml
time_shift: float (ms)
velocity  : float (0-1)
note      : int
duration  : float (ms)
```

<Transform :scale=1>

```mermaid
flowchart TB;
    
    subgraph Tokenization [Tokenization Process]
        direction LR
        A[Input JSON File] --> B[Load & Validate];
        B --> C[Extract Notes];
        C --> D[Compute Time Shifts];
        D --> E[Tokenize Notes];
        E --> F[Convert Notes to IDs];
        F --> G[Tokenized Output];
    end
    Tokenization --> Detokenization

    subgraph Detokenization [Detokenization Process]
      direction LR
        GG[Tokenized Output] --> H[De-tokenize];
        H --> I[Convert IDs to Notes];
        I --> J[Reconstruct Events];
        J --> K[Save to JSON];
    end
```

</Transform>

<!-- Explain the perceived problems with previous attempts. -->
<!-- Explain Continous tokenization -->
<!-- Show model diagram -->
<!-- Explain Results -->

---
---

## V5: Arquitectura
<Transform :scale=1>

```mermaid
graph LR;

    %% Token Embedding
    subgraph Embedding_Layers [Embedding Layers]
        direction LR;
        A[Input Tokens] --> B[Pitch Embedding];
        A2[Time Shift] --> B2[Time Shift Linear Projection];
        A3[Duration] --> B3[Duration Linear Projection];
        A4[Velocity] --> B4[Weight Linear Projection];
        B & B2 & B3 & B4 --> C[Sum Embeddings];
    end
    Embedding_Layers --> Transformer_Decoder
    %% Transformer Decoder
    subgraph Transformer_Decoder [Transformer Decoder]
        D[Multi-Head Attention];
        D --> D1[Self-Attention Layers];
        D1 --> D2[Layer Norm];
        D2 --> D3[FFN];
        D3 --> D4[Dropout];
        D4 --> E[Transformer Output];
    end
    Transformer_Decoder --> Output_Layers
    %% Output Layers
    subgraph Output_Layers [Output Layers]
        EE[Transformer Output]
        EE --> F1[Pitch Prediction];
        EE --> F2[Time Shift Prediction];
        EE --> F3[Duration Prediction];
        EE --> F4[Weight Prediction];
    end

    %% Loss Computation
    subgraph Loss_Functions [Loss Computation]
        F1 -->|CE| L1[Pitch Loss];
        F2 -->|MSE| L2[Time Shift Loss];
        F3 -->|MSE| L3[Duration Loss];
        F4 -->|MSE| L4[Weight Loss];
        L1 & L2 & L3 & L4 --> L_Total[Weighted Total Loss];
    end
```
</Transform>

<v-clicks>

- Los resultados no fueron buenos: Siempre predecia silencio o time shifts negativos
- Posiblemente la funcion objetivo estaba mal definida
- Posiblemente faltó mayor tiempo de entrenamiento

</v-clicks>

---
---

# V6
<v-clicks>

- La complejidad del modelo anterior no funcionó
- Simplificamos el modelo a lo mas simple posible
![](/images/craykh-tokenization.png)
- Lo habia visto funcionando
- Despues volvemos a los resultados

</v-clicks>
<!-- Explain why CrayKH -->
<!-- It seemed to work for them; + Simplicity -->

---
---

# V7

<!-- Explain the MusicTransformer architecture -->

<v-clicks>

- Como baseline estaba usando el Paper de MusicTransformer.
- El modelo de Relative Self Attention permite reducir el la complejidad espacial de cuadrática a lineal poniendo una cota superior en la distancia de atención.

</v-clicks>

---
---
<Transform :scale=1>

```mermaid
graph LR;

    %% Embedding Layer
    subgraph Embedding_Layer [Embedding Layer]
        A[Input Tokens] -->|Embedding Lookup| B[Token Embedding];
        B -->|Positional Encoding| C[Embedded Input];
    end
    Embedding_Layer --> Decoder_Layers
    %% Decoder Layers
    subgraph Decoder_Layers [Decoder Layers]
        CC[Embedded Input] -->|Pass Through| D1[Decoder Layer 1];
        D1 -->|Pass Through| D2[Decoder Layer 2];
        D2 -->|...| Dn[Decoder Layer N];
    end

    %% Self-Attention Block
    subgraph Self_Attention_Block [Relative Self-Attention]
        direction LR;
        subgraph Relative_Positional_Encoding [Relative Positional Encoding]
            R1[Relative Position Embeddings] -->|Matmul| R2[Relative Score Computation];
            R2 -->|Skew Operation| R3[Shifted Attention Scores];
        end
        
        subgraph Standard_Attention [Standard Scaled Dot-Product Attention]
            Q[Query] -->|Matmul| K[Key Transpose];
            K -->|Matmul| S[Standard Attention Scores];
        end

        Standard_Attention -->|Sum & Scale| M[Combined Scores];
        Relative_Positional_Encoding -->|Sum & Scale| M;
        M -->|Softmax| W[Attention Weights];
        W -->|Matmul| V[Value];
    end

    %% Decoder Layer Processing
    subgraph Decoder_Processing [Decoder Processing]
        VV[Value] -->|Layer Norm| L1[Norm 1];
        L1 -->|Residual Connection| R[Residual Sum];
        R -->|Feed Forward Network| FFN[FFN];
        FFN -->|Layer Norm| L2[Norm 2];
    end

    %% Output Projection
    subgraph Output_Layers [Output Layers]
        L22[Norm 2] -->|Final Norm| F1[Final Layer Norm];
        F1 -->|Linear Projection| F2[Logits Projection];
    end

    %% Flow Connections
    Decoder_Layers --> Self_Attention_Block;
    Self_Attention_Block --> Decoder_Processing;
    Decoder_Processing --> Output_Layers;
```
</Transform>

---
---

# Resultados

<!-- Explain the premise: we need comparable results -->
<!-- Explain why no V5 and no TF Model -->

<!-- Show results -->

<!-- Piano renderer:

Take a midi file, load it, show a piano roll.
Allow playing the midi file using synths or (maybe?) real midi device.
(?Allow pre-recording a piece on a real midi device to playback the audio?)

Maybe also show tokenizations?

 -->

---
---

# Learn More

[Documentation](https://sli.dev) · [GitHub](https://github.com/slidevjs/slidev) · [Showcases](https://sli.dev/resources/showcases)

<PoweredBySlidev mt-10 />
