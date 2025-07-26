(define (domain mucche-intergalattiche)
  (:requirements :strips :typing :negative-preconditions)
  (:types
    protagonist
    location
  )

  (:constants
    villaggio-bovino
    spazio-aperto
    campo-di-asteroidi
    nave-nemica - location
  )

  (:predicates
    (at ?p - protagonist ?l - location)
    (in-nave ?p - protagonist)
    (has-mappa ?p - protagonist)
    (has-formaggio ?p - protagonist)
    (viaggio-pianificato ?p - protagonist)
    (nave-danneggiata)
    (enigma-risolto)
    (consiglio-ricevuto)
    (sfida-inviata)
  )

  (:action pianificare-viaggio
    :parameters (?p - protagonist)
    :precondition (and
      (at ?p villaggio-bovino)
      (has-mappa ?p)
      (not (viaggio-pianificato ?p))
    )
    :effect (and
      (viaggio-pianificato ?p)
    )
  )

  (:action parlare-con-anziani
    :parameters (?p - protagonist)
    :precondition (and
      (at ?p villaggio-bovino)
    )
    :effect (and
      (consiglio-ricevuto)
    )
  )

  (:action decollare
    :parameters (?p - protagonist)
    :precondition (and
      (at ?p villaggio-bovino)
      (viaggio-pianificato ?p)
    )
    :effect (and
      (not (at ?p villaggio-bovino))
      (in-nave ?p)
      (at ?p spazio-aperto)
    )
  )

  (:action decollare-e-navigare-ad-asteroidi
    :parameters (?p - protagonist)
    :precondition (and
      (at ?p villaggio-bovino)
      (viaggio-pianificato ?p)
    )
    :effect (and
      (not (at ?p villaggio-bovino))
      (in-nave ?p)
      (at ?p campo-di-asteroidi)
    )
  )

  (:action navigare-ad-asteroidi
    :parameters (?p - protagonist)
    :precondition (and
      (in-nave ?p)
      (at ?p spazio-aperto)
    )
    :effect (and
      (not (at ?p spazio-aperto))
      (at ?p campo-di-asteroidi)
    )
  )

  (:action attraversare-asteroidi-e-danneggiarsi
    :parameters (?p - protagonist)
    :precondition (and
      (in-nave ?p)
      (at ?p campo-di-asteroidi)
    )
    :effect (and
      (not (at ?p campo-di-asteroidi))
      (at ?p nave-nemica)
      (nave-danneggiata)
    )
  )

  (:action attraversare-asteroidi-senza-danno
    :parameters (?p - protagonist)
    :precondition (and
      (in-nave ?p)
      (at ?p campo-di-asteroidi)
    )
    :effect (and
      (not (at ?p campo-di-asteroidi))
      (at ?p nave-nemica)
    )
  )

  (:action riparare-nave
    :parameters (?p - protagonist)
    :precondition (and
      (in-nave ?p)
      (at ?p nave-nemica)
      (nave-danneggiata)
    )
    :effect (and
      (not (nave-danneggiata))
    )
  )

  (:action inviare-messaggio-di-sfida
    :parameters (?p - protagonist)
    :precondition (and
      (in-nave ?p)
      (at ?p nave-nemica)
    )
    :effect (and
      (sfida-inviata)
    )
  )

  (:action risolvere-enigma-e-sconfiggere-alieni
    :parameters (?p - protagonist)
    :precondition (and
      (in-nave ?p)
      (at ?p nave-nemica)
      (not (nave-danneggiata))
    )
    :effect (and
      (enigma-risolto)
    )
  )

  (:action recuperare-formaggio-e-tornare
    :parameters (?p - protagonist)
    :precondition (and
      (in-nave ?p)
      (at ?p nave-nemica)
      (enigma-risolto)
    )
    :effect (and
      (not (in-nave ?p))
      (not (at ?p nave-nemica))
      (at ?p villaggio-bovino)
      (has-formaggio ?p)
    )
  )

  (:action risolvere-sconfiggere-recuperare-tornare
    :parameters (?p - protagonist)
    :precondition (and
      (in-nave ?p)
      (at ?p nave-nemica)
      (not (nave-danneggiata))
    )
    :effect (and
      (not (in-nave ?p))
      (not (at ?p nave-nemica))
      (at ?p villaggio-bovino)
      (has-formaggio ?p)
    )
  )
)