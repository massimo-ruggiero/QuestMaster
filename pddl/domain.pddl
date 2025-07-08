(define (domain sherpa-quest)
  (:requirements :strips :typing)
  (:types
    protagonist location substance
  )

  (:predicates
    (at ?p - protagonist ?l - location)
    (is-desperate ?p - protagonist)
    (shopkeeper-is-angry)
    (shopkeeper-is-suspicious)
    (dealers-are-gone)
    (has-obtained ?p - protagonist ?s - substance)
    (has-reliable-contact ?p - protagonist)
    (has-unreliable-contact ?p - protagonist)
    (knows-dealer-location ?p - protagonist)
    (wasted-time)
    (got-scammed)
  )

  (:action call-old-friend
    :parameters (?p - protagonist ?l - location)
    :precondition (and
      (at ?p ?l)
      (is-desperate ?p)
      (not (has-reliable-contact ?p))
      (not (has-unreliable-contact ?p))
    )
    :effect (and
      (has-reliable-contact ?p)
    )
  )

  (:action ask-suspicious-student
    :parameters (?p - protagonist ?l - location)
    :precondition (and
      (at ?p ?l)
      (is-desperate ?p)
      (not (has-reliable-contact ?p))
      (not (has-unreliable-contact ?p))
    )
    :effect (and
      (has-unreliable-contact ?p)
    )
  )

  (:action wander-to-new-district
    :parameters (?p - protagonist ?from - location ?to - location)
    :precondition (and
      (at ?p ?from)
    )
    :effect (and
      (not (at ?p ?from))
      (at ?p ?to)
    )
  )

  (:action apologize-to-shopkeeper
    :parameters (?p - protagonist)
    :precondition (and
      (shopkeeper-is-angry)
    )
    :effect (and
      (not (shopkeeper-is-angry))
      (shopkeeper-is-suspicious)
    )
  )

  (:action meet-friend
    :parameters (?p - protagonist ?from - location ?to - location)
    :precondition (and
      (has-reliable-contact ?p)
      (at ?p ?from)
    )
    :effect (and
      (not (at ?p ?from))
      (at ?p ?to)
    )
  )

  (:action hesitate-and-lose-contact
    :parameters (?p - protagonist)
    :precondition (and
      (has-reliable-contact ?p)
    )
    :effect (and
      (not (has-reliable-contact ?p))
    )
  )

  (:action get-dealer-info
    :parameters (?p - protagonist ?l - location)
    :precondition (and
      (at ?p ?l)
      (has-reliable-contact ?p)
      (not (knows-dealer-location ?p))
    )
    :effect (and
      (knows-dealer-location ?p)
    )
  )

  (:action chat-and-waste-time
    :parameters (?p - protagonist ?l - location)
    :precondition (and
      (at ?p ?l)
      (not (wasted-time))
    )
    :effect (and
      (wasted-time)
    )
  )

  (:action go-to-dealer
    :parameters (?p - protagonist ?from - location ?to - location)
    :precondition (and
      (knows-dealer-location ?p)
      (at ?p ?from)
    )
    :effect (and
      (not (at ?p ?from))
      (at ?p ?to)
    )
  )

  (:action buy-sherpa
    :parameters (?p - protagonist ?s - substance ?l - location)
    :precondition (and
      (at ?p ?l)
      (knows-dealer-location ?p)
      (is-desperate ?p)
    )
    :effect (and
      (has-obtained ?p ?s)
      (not (is-desperate ?p))
    )
  )

  (:action return-from-new-district
    :parameters (?p - protagonist ?from - location ?to - location)
    :precondition (and
      (at ?p ?from)
    )
    :effect (and
      (not (at ?p ?from))
      (at ?p ?to)
    )
  )

  (:action search-new-district-for-contacts
    :parameters (?p - protagonist ?l - location)
    :precondition (and
      (at ?p ?l)
      (not (has-unreliable-contact ?p))
    )
    :effect (and
      (has-unreliable-contact ?p)
    )
  )

  (:action meet-unreliable-contact
    :parameters (?p - protagonist)
    :precondition (and
      (has-unreliable-contact ?p)
    )
    :effect (and
      (not (has-unreliable-contact ?p))
      (got-scammed)
    )
  )

  (:action ignore-unreliable-contact
    :parameters (?p - protagonist)
    :precondition (and
      (has-unreliable-contact ?p)
    )
    :effect (and
      (not (has-unreliable-contact ?p))
    )
  )
)