package com.helpdesk.ticket.repository;

import com.helpdesk.ticket.entity.Ticket;
import com.helpdesk.ticket.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByAuthorId(Long userId);

    long countByStatus(TicketStatus status);

    // Поиск только по заголовку и тексту вопроса (временный rollback тегов).
    @Query("""
            select t from Ticket t
            where lower(t.title) like lower(concat('%', :query, '%'))
               or lower(t.description) like lower(concat('%', :query, '%'))
            """)
    List<Ticket> searchByQuery(String query);
}
